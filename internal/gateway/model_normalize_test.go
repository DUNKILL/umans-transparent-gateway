package gateway

import (
	"encoding/json"
	"testing"
)

func TestNormalizeModelNameRemovesDurationSuffix(t *testing.T) {
	cases := map[string]string{
		"umans-glm-5.2[1m]":        "umans-glm-5.2",
		"claude-opus-4-8[1m]":      "claude-opus-4-8",
		"claude-sonnet-4-6[30s]":   "claude-sonnet-4-6",
		"umans-glm-5.2":            "umans-glm-5.2",
		"umans-glm-5.2-preview[x]": "umans-glm-5.2-preview[x]",
	}
	for in, want := range cases {
		if got := normalizeModelName(in); got != want {
			t.Fatalf("normalizeModelName(%q)=%q want %q", in, got, want)
		}
	}
}

func TestNormalizeModelInJSONOnlyChangesTopLevelModel(t *testing.T) {
	body := normalizeModelInJSON([]byte(`{"model":"umans-glm-5.2[1m]","messages":[{"role":"user","content":"keep umans-glm-5.2[1m] here"}]}`))
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatal(err)
	}
	if got := payload["model"]; got != "umans-glm-5.2" {
		t.Fatalf("model=%v", got)
	}
	messages := payload["messages"].([]any)
	msg := messages[0].(map[string]any)
	if got := msg["content"]; got != "keep umans-glm-5.2[1m] here" {
		t.Fatalf("content changed: %v", got)
	}
}

func TestNormalizeRequestJSONConvertsTupleItemsSchema(t *testing.T) {
	body := normalizeRequestJSON([]byte(`{
	  "model":"umans-glm-5.2[1m]",
	  "tools":[{
	    "name":"plot",
	    "input_schema":{
	      "type":"object",
	      "properties":{
	        "coordinate":{
	          "type":"array",
	          "items":[{"type":"number"},{"type":"number"}],
	          "additionalItems":false
	        }
	      }
	    }
	  }]
	}`), true)
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatal(err)
	}
	if got := payload["model"]; got != "umans-glm-5.2" {
		t.Fatalf("model=%v", got)
	}
	tools := payload["tools"].([]any)
	tool := tools[0].(map[string]any)
	schema := tool["input_schema"].(map[string]any)
	properties := schema["properties"].(map[string]any)
	coordinate := properties["coordinate"].(map[string]any)
	if _, ok := coordinate["items"].([]any); ok {
		t.Fatalf("items still uses tuple array: %#v", coordinate["items"])
	}
	if got := coordinate["items"]; got != false {
		t.Fatalf("items=%#v, want false", got)
	}
	prefixItems, ok := coordinate["prefixItems"].([]any)
	if !ok || len(prefixItems) != 2 {
		t.Fatalf("prefixItems=%#v", coordinate["prefixItems"])
	}
	if _, exists := coordinate["additionalItems"]; exists {
		t.Fatalf("additionalItems should be removed")
	}
}

func TestNormalizeRequestJSONAllowsAdditionalTupleItemsByDefault(t *testing.T) {
	body := normalizeRequestJSON([]byte(`{"tools":[{"function":{"parameters":{"type":"object","properties":{"pair":{"type":"array","items":[{"type":"number"},{"type":"number"}]}}}}}]}`), true)
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatal(err)
	}
	tools := payload["tools"].([]any)
	tool := tools[0].(map[string]any)
	fn := tool["function"].(map[string]any)
	params := fn["parameters"].(map[string]any)
	props := params["properties"].(map[string]any)
	pair := props["pair"].(map[string]any)
	if got := pair["items"]; got != true {
		t.Fatalf("items=%#v, want true", got)
	}
	if prefixItems := pair["prefixItems"].([]any); len(prefixItems) != 2 {
		t.Fatalf("prefixItems=%#v", prefixItems)
	}
}

func TestNormalizeRequestJSONCanDisableSchemaCompat(t *testing.T) {
	body := normalizeRequestJSON([]byte(`{"model":"umans-glm-5.2[1m]","tools":[{"input_schema":{"type":"object","properties":{"pair":{"type":"array","items":[{"type":"number"},{"type":"number"}]}}}}]}`), false)
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatal(err)
	}
	if got := payload["model"]; got != "umans-glm-5.2" {
		t.Fatalf("model=%v", got)
	}
	tools := payload["tools"].([]any)
	tool := tools[0].(map[string]any)
	schema := tool["input_schema"].(map[string]any)
	props := schema["properties"].(map[string]any)
	pair := props["pair"].(map[string]any)
	if _, ok := pair["items"].([]any); !ok {
		t.Fatalf("items should stay as tuple array when schema compat is disabled: %#v", pair["items"])
	}
	if _, exists := pair["prefixItems"]; exists {
		t.Fatalf("prefixItems should not be added when schema compat is disabled")
	}
}

// TestNormalizeRequestJSONDoesNotCorruptNonSchemaItemsField is a regression
// guard: a nested object whose field is named "items" and holds an array, but
// is NOT a JSON-Schema array declaration (no type:array), must be left
// untouched. Previously SchemaCompat rewrote every such field: it moved the
// array to prefixItems and clobbered items to true, corrupting user payloads
// (e.g. tool inputs) and producing upstream 400 errors.
func TestNormalizeRequestJSONDoesNotCorruptNonSchemaItemsField(t *testing.T) {
	in := []byte(`{"model":"umans-glm-5.2","messages":[{"role":"user","content":[{"type":"tool_use","name":"x","input":{"items":["a","b","c"]}}]}]}`)
	out := normalizeRequestJSON(in, true)
	var payload map[string]any
	if err := json.Unmarshal(out, &payload); err != nil {
		t.Fatal(err)
	}
	msgs := payload["messages"].([]any)
	msg := msgs[0].(map[string]any)
	content := msg["content"].([]any)
	toolUse := content[0].(map[string]any)
	input := toolUse["input"].(map[string]any)
	items, ok := input["items"].([]any)
	if !ok {
		t.Fatalf("items was corrupted: %#v (type %T)", input["items"], input["items"])
	}
	if len(items) != 3 || items[0] != "a" {
		t.Fatalf("items content changed: %#v", items)
	}
	if _, exists := input["prefixItems"]; exists {
		t.Fatalf("prefixItems must not be added to a non-schema field: %#v", input)
	}
}

// TestNormalizeRequestJSONStillConvertsDeeplyNestedTupleSchema ensures the
// type:array guard did not break conversion of tuple schemas nested inside
// tool input_schema (the original purpose of SchemaCompat).
func TestNormalizeRequestJSONStillConvertsDeeplyNestedTupleSchema(t *testing.T) {
	body := normalizeRequestJSON([]byte(`{
	  "model":"umans-glm-5.2",
	  "tools":[{"name":"plot","input_schema":{"type":"object","properties":{"coord":{"type":"array","items":[{"type":"number"},{"type":"number"}],"additionalItems":false}}}}]
	}`), true)
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatal(err)
	}
	tools := payload["tools"].([]any)
	tool := tools[0].(map[string]any)
	schema := tool["input_schema"].(map[string]any)
	props := schema["properties"].(map[string]any)
	coord := props["coord"].(map[string]any)
	if got := coord["items"]; got != false {
		t.Fatalf("items=%#v, want false (additionalItems:false)", got)
	}
	prefix, ok := coord["prefixItems"].([]any)
	if !ok || len(prefix) != 2 {
		t.Fatalf("prefixItems=%#v", coord["prefixItems"])
	}
	if _, exists := coord["additionalItems"]; exists {
		t.Fatalf("additionalItems should be removed")
	}
}
