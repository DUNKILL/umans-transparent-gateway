package gateway

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"
)

const (
	DefaultConfigDir  = "config"
	ConfigFileName    = "config.json"
	KeyConfigFileName = "key.json"
)

type ConfigFile struct {
	Listen                 string `json:"listen"`
	UpstreamBaseURL        string `json:"upstreamBaseURL"`
	DefaultModel           string `json:"defaultModel"`
	OpusModel              string `json:"opusModel"`
	SonnetModel            string `json:"sonnetModel"`
	HaikuModel             string `json:"haikuModel"`
	KeyConcurrencyLimit    int    `json:"keyConcurrencyLimit"`
	KeyQueueTimeout        string `json:"keyQueueTimeout"`
	UpstreamRetryMax       int    `json:"upstreamRetryMax"`
	Retry429               bool   `json:"retry429"`
	UpstreamRetryBaseDelay string `json:"upstreamRetryBaseDelay"`
	UpstreamRetryMaxDelay  string `json:"upstreamRetryMaxDelay"`
	SchemaCompat           bool   `json:"schemaCompat"`
	CatalogTTL             string `json:"catalogTTL"`
	SearchMode             string `json:"searchMode"`
	BudgetPolicy           string `json:"budgetPolicy"`
	ErrorEventDir          string `json:"errorEventDir"`
	ErrorEventMaxAge       string `json:"errorEventMaxAge"`
	ErrorEventMaxSize      int64  `json:"errorEventMaxSize"`
	AdminPassword          string `json:"adminPassword"`
	ProxyAccessToken       string `json:"proxyAccessToken"`
	StickySession          bool   `json:"stickySession"`
	StickySessionTTL       string `json:"stickySessionTTL"`
	KeyErrorThreshold      int    `json:"keyErrorThreshold"`
	KeyErrorWindow         string `json:"keyErrorWindow"`
	KeyErrorBackoff        string `json:"keyErrorBackoff"`
	LogErrorMessage        bool   `json:"logErrorMessage"`
}

type ManagedKey struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Key              string `json:"key"`
	Enabled          bool   `json:"enabled"`
	ConcurrencyLimit int    `json:"concurrencyLimit"`
	CreatedAt        string `json:"createdAt,omitempty"`
	UpdatedAt        string `json:"updatedAt,omitempty"`
}

type KeyConfigFile struct {
	Keys []ManagedKey `json:"keys"`
}

func ConfigDirFromEnv() string {
	if v := envString("UMANS_CONFIG_DIR", ""); v != "" {
		return v
	}
	return DefaultConfigDir
}

func EnsureConfigFiles(dir string) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	configPath := filepath.Join(dir, ConfigFileName)
	if _, err := os.Stat(configPath); errors.Is(err, os.ErrNotExist) {
		if err := WriteConfigFile(configPath, ConfigToFile(DefaultConfig())); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	keyPath := filepath.Join(dir, KeyConfigFileName)
	if _, err := os.Stat(keyPath); errors.Is(err, os.ErrNotExist) {
		if err := WriteKeyConfigFile(keyPath, KeyConfigFile{Keys: []ManagedKey{}}); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	return nil
}

func LoadConfigFile(path string) (Config, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return Config{}, err
	}
	var f ConfigFile
	if err := json.Unmarshal(raw, &f); err != nil {
		return Config{}, err
	}
	cfg, err := f.ToConfig()
	if err != nil {
		return Config{}, err
	}
	return cfg, cfg.Validate()
}

func LoadKeyConfigFile(path string) (KeyConfigFile, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return KeyConfigFile{}, err
	}
	var f KeyConfigFile
	if err := json.Unmarshal(raw, &f); err != nil {
		return KeyConfigFile{}, err
	}
	if f.Keys == nil {
		f.Keys = []ManagedKey{}
	}
	return f, nil
}

func WriteConfigFile(path string, f ConfigFile) error {
	return writeJSONFile(path, f)
}

func WriteKeyConfigFile(path string, f KeyConfigFile) error {
	if f.Keys == nil {
		f.Keys = []ManagedKey{}
	}
	return writeJSONFile(path, f)
}

func writeJSONFile(path string, v any) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func ConfigToFile(cfg Config) ConfigFile {
	return ConfigFile{
		Listen:                 cfg.Listen,
		UpstreamBaseURL:        cfg.UpstreamBaseURL,
		DefaultModel:           cfg.DefaultModel,
		OpusModel:              cfg.OpusModel,
		SonnetModel:            cfg.SonnetModel,
		HaikuModel:             cfg.HaikuModel,
		KeyConcurrencyLimit:    cfg.KeyConcurrency,
		KeyQueueTimeout:        cfg.KeyQueueTimeout.String(),
		UpstreamRetryMax:       cfg.UpstreamRetryMax,
		Retry429:               cfg.Retry429,
		UpstreamRetryBaseDelay: cfg.UpstreamRetryBase.String(),
		UpstreamRetryMaxDelay:  cfg.UpstreamRetryCap.String(),
		SchemaCompat:           cfg.SchemaCompat,
		CatalogTTL:             cfg.CatalogTTL.String(),
		SearchMode:             string(cfg.SearchMode),
		BudgetPolicy:           string(cfg.BudgetPolicy),
		ErrorEventDir:          cfg.ErrorEventDir,
		ErrorEventMaxAge:       cfg.ErrorEventMaxAge.String(),
		ErrorEventMaxSize:      cfg.ErrorEventMaxSize,
		AdminPassword:          cfg.AdminPassword,
		ProxyAccessToken:       cfg.ProxyAccessToken,
		StickySession:          cfg.StickySession,
		StickySessionTTL:       cfg.StickySessionTTL.String(),
		KeyErrorThreshold:      cfg.KeyErrorThreshold,
		KeyErrorWindow:         cfg.KeyErrorWindow.String(),
		KeyErrorBackoff:        cfg.KeyErrorBackoff.String(),
		LogErrorMessage:        cfg.LogErrorMessage,
	}
}

func (f ConfigFile) ToConfig() (Config, error) {
	cfg := DefaultConfig()
	cfg.Listen = defaultString(f.Listen, cfg.Listen)
	cfg.UpstreamBaseURL = defaultString(f.UpstreamBaseURL, cfg.UpstreamBaseURL)
	cfg.DefaultModel = defaultString(f.DefaultModel, cfg.DefaultModel)
	cfg.OpusModel = defaultString(f.OpusModel, cfg.OpusModel)
	cfg.SonnetModel = defaultString(f.SonnetModel, cfg.SonnetModel)
	cfg.HaikuModel = defaultString(f.HaikuModel, cfg.HaikuModel)
	if f.KeyConcurrencyLimit > 0 {
		cfg.KeyConcurrency = f.KeyConcurrencyLimit
	}
	if f.KeyQueueTimeout != "" {
		d, err := time.ParseDuration(f.KeyQueueTimeout)
		if err != nil {
			return Config{}, err
		}
		cfg.KeyQueueTimeout = d
	}
	cfg.UpstreamRetryMax = f.UpstreamRetryMax
	cfg.Retry429 = f.Retry429
	if f.UpstreamRetryBaseDelay != "" {
		d, err := time.ParseDuration(f.UpstreamRetryBaseDelay)
		if err != nil {
			return Config{}, err
		}
		cfg.UpstreamRetryBase = d
	}
	if f.UpstreamRetryMaxDelay != "" {
		d, err := time.ParseDuration(f.UpstreamRetryMaxDelay)
		if err != nil {
			return Config{}, err
		}
		cfg.UpstreamRetryCap = d
	}
	cfg.SchemaCompat = f.SchemaCompat
	if f.CatalogTTL != "" {
		d, err := time.ParseDuration(f.CatalogTTL)
		if err != nil {
			return Config{}, err
		}
		cfg.CatalogTTL = d
	}
	cfg.SearchMode = SearchMode(defaultString(f.SearchMode, string(cfg.SearchMode)))
	cfg.BudgetPolicy = BudgetPolicy(defaultString(f.BudgetPolicy, string(cfg.BudgetPolicy)))
	cfg.ErrorEventDir = defaultString(f.ErrorEventDir, cfg.ErrorEventDir)
	if f.ErrorEventMaxAge != "" {
		d, err := time.ParseDuration(f.ErrorEventMaxAge)
		if err != nil {
			return Config{}, err
		}
		cfg.ErrorEventMaxAge = d
	}
	if f.ErrorEventMaxSize > 0 {
		cfg.ErrorEventMaxSize = f.ErrorEventMaxSize
	}
	cfg.AdminPassword = defaultString(f.AdminPassword, cfg.AdminPassword)
	cfg.ProxyAccessToken = f.ProxyAccessToken
	cfg.StickySession = f.StickySession
	if f.StickySessionTTL != "" {
		d, err := time.ParseDuration(f.StickySessionTTL)
		if err != nil {
			return Config{}, err
		}
		cfg.StickySessionTTL = d
	}
	cfg.KeyErrorThreshold = f.KeyErrorThreshold
	if f.KeyErrorWindow != "" {
		d, err := time.ParseDuration(f.KeyErrorWindow)
		if err != nil {
			return Config{}, err
		}
		cfg.KeyErrorWindow = d
	}
	if f.KeyErrorBackoff != "" {
		d, err := time.ParseDuration(f.KeyErrorBackoff)
		if err != nil {
			return Config{}, err
		}
		cfg.KeyErrorBackoff = d
	}
	cfg.LogErrorMessage = f.LogErrorMessage
	return cfg, nil
}

func defaultString(v, fallback string) string {
	if v != "" {
		return v
	}
	return fallback
}
