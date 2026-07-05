package gateway

import (
	"encoding/json"
	"regexp"
	"strings"
)

var modelDurationSuffix = regexp.MustCompile(`\[(?:\d+[smhd]|1m)\]$`)

func normalizeModelName(model string) string {
	model = strings.TrimSpace(model)
	if model == "" {
		return model
	}
	return modelDurationSuffix.ReplaceAllString(model, "")
}

func normalizeModelInJSON(body []byte) []byte {
	return normalizeRequestJSON(body, true)
}

func normalizeRequestJSON(body []byte, schemaCompat bool) []byte {
	if len(body) == 0 {
		return body
	}
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return body
	}
	changed := false
	if schemaCompat {
		changed = normalizeJSONSchemaDraft(&payload)
	}
	if normalizeSamplingParams(&payload) {
		changed = true
	}
	model, ok := payload["model"].(string)
	if ok {
		normalized := normalizeModelName(model)
		if normalized != model {
			payload["model"] = normalized
			changed = true
		}
	}
	if !changed {
		return body
	}
	next, err := json.Marshal(payload)
	if err != nil {
		return body
	}
	return next
}

// normalizeSamplingParams fixes sampling parameters that some clients send
// with values the upstream rejects. Currently handled:
//   - top_k: upstream requires -1 (disabled) or >= 1. A 0 (or any value < 1
//     that is not -1) is rewritten to -1 so the request is accepted.
//
// We intentionally keep the rule conservative: only the documented invalid
// case is normalized. Values >= 1 are forwarded untouched.
func normalizeSamplingParams(payload *map[string]any) bool {
	if payload == nil || *payload == nil {
		return false
	}
	v, ok := (*payload)["top_k"]
	if !ok {
		return false
	}
	n, ok := toFloat(v)
	if !ok {
		return false
	}
	// -1 is the upstream "disabled" sentinel and is forwarded as-is. Any other
	// value below 1 (0 being the common offender) is invalid upstream; rewrite
	// to -1 rather than dropping the field, so behavior matches "disabled".
	if n == -1 || n >= 1 {
		return false
	}
	(*payload)["top_k"] = -1
	return true
}

// toFloat reports whether v is a JSON number (int or float64) and returns it
// as a float64. Booleans and strings are not treated as numbers here.
func toFloat(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	}
	return 0, false
}

func normalizeJSONSchemaDraft(v any) bool {
	changed := false
	switch x := v.(type) {
	case *map[string]any:
		if x == nil {
			return false
		}
		changed = normalizeJSONSchemaDraftMap(*x)
	case map[string]any:
		changed = normalizeJSONSchemaDraftMap(x)
	case []any:
		for _, item := range x {
			if normalizeJSONSchemaDraft(item) {
				changed = true
			}
		}
	}
	return changed
}

func normalizeJSONSchemaDraftMap(m map[string]any) bool {
	// Always recurse first so deeply-nested tuple schemas are still converted
	// even when this map itself is not an array schema.
	changed := false
	for _, v := range m {
		if normalizeJSONSchemaDraft(v) {
			changed = true
		}
	}
	// Only treat THIS map as a JSON-Schema array tuple when it declares
	// "type":"array". Without this guard, ANY nested object whose field
	// happens to be named "items" and hold an array would be rewritten: the
	// array gets moved to "prefixItems" and "items" is clobbered to true,
	// corrupting user payloads (e.g. tool inputs) and causing upstream 400s.
	if stringValue(m["type"], "") != "array" {
		return changed
	}
	items, ok := m["items"].([]any)
	if !ok {
		return changed
	}
	if _, exists := m["prefixItems"]; !exists {
		m["prefixItems"] = items
		changed = true
	}
	if additional, exists := m["additionalItems"]; exists {
		switch additional.(type) {
		case bool, map[string]any:
			m["items"] = additional
		default:
			m["items"] = true
		}
		delete(m, "additionalItems")
		changed = true
	} else {
		m["items"] = true
		changed = true
	}
	return changed
}
