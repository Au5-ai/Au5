import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { SystemConfigs } from "@/shared/types";
import { validateUrl } from "@/shared/lib/utils";
import { systemController } from "@/shared/network/api/systemController";

const defaultConfigs: SystemConfigs = {
  organizationName: "",
  botName: "",
  botFatherUrl: "",
  botHubUrl: "",
  hubUrl: "",
  serviceBaseUrl: "",
  panelUrl: "",
  direction: "rtl",
  language: "fa-IR",
  openAIToken: "",
  openAIProxyUrl: "",
  meetingTranscriptionModel: "liveCaption",
  autoLeaveWaitingEnter: 30000,
  autoLeaveNoParticipant: 60000,
  autoLeaveAllParticipantsLeft: 120000,
  meetingVideoRecording: false,
  meetingAudioRecording: false,
  meetingTranscription: true,
};

export function SystemConfigsTab() {
  const [configs, setConfigs] = useState<SystemConfigs>(defaultConfigs);
  const [originalConfigs, setOriginalConfigs] =
    useState<SystemConfigs>(defaultConfigs);
  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState<
    Partial<Record<keyof SystemConfigs, string>>
  >({});

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const configData = await systemController.getConfig();
        if (configData) {
          setConfigs(configData);
          setOriginalConfigs(configData);
        }
      } catch {
        setConfigs(defaultConfigs);
        setOriginalConfigs(defaultConfigs);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Check if configs have changed from original
  const hasConfigsChanged = () => {
    return JSON.stringify(configs) !== JSON.stringify(originalConfigs);
  };

  const validateField = (
    field: keyof SystemConfigs,
    value: string | number | boolean,
  ): string | null => {
    switch (field) {
      case "organizationName":
      case "botName":
        return !value || (typeof value === "string" && value.trim().length < 2)
          ? "Must be at least 2 characters"
          : null;

      case "botFatherUrl":
      case "botHubUrl":
      case "hubUrl":
      case "serviceBaseUrl":
      case "panelUrl":
        return !validateUrl(value as string) ? "Must be a valid URL" : null;

      case "openAIToken":
        return !value || (typeof value === "string" && value.trim().length < 10)
          ? "Token must be at least 10 characters"
          : null;

      case "openAIProxyUrl":
        return value && typeof value === "string" && value.trim() && !validateUrl(value as string)
          ? "Must be a valid URL" 
          : null;

      case "autoLeaveWaitingEnter":
      case "autoLeaveNoParticipant":
      case "autoLeaveAllParticipantsLeft":
        return typeof value === "number" && (value < 1000 || value > 300000)
          ? "Must be between 1000 and 300000 milliseconds"
          : null;

      default:
        return null;
    }
  };

  const handleInputChange = (
    field: keyof SystemConfigs,
    value: string | number | boolean,
  ) => {
    setConfigs((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSave = () => {
    const newErrors: Partial<Record<keyof SystemConfigs, string>> = {};

    Object.entries(configs).forEach(([key, value]) => {
      const error = validateField(key as keyof SystemConfigs, value);
      if (error) {
        newErrors[key as keyof SystemConfigs] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      systemController
        .setConfig(configs)
        .then(() => {
          setOriginalConfigs(configs); // Update original configs after successful save
          toast.success("Your system settings have been updated successfully.");
        })
        .catch(() => {
          toast.error("Failed to update system settings.");
        });
    } else {
      toast.error("Please fix the errors before saving.");
    }
  };

  const handleReset = () => {
    setConfigs(originalConfigs);
    setErrors({});
    toast.info("All settings have been reset to last saved values.");
  };

  return isLoading ? (
    <div className="min-h-100 w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Configs...</p>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto space-y-8 pt-6">
      <div className="space-y-8">
        {/* Organization Settings */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">Organization & Bot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={configs.organizationName}
                onChange={(e) =>
                  handleInputChange("organizationName", e.target.value)
                }
                className={errors.organizationName ? "border-destructive" : ""}
              />
              {errors.organizationName && (
                <p className="text-sm text-destructive">
                  {errors.organizationName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                value={configs.botName}
                onChange={(e) => handleInputChange("botName", e.target.value)}
                className={errors.botName ? "border-destructive" : ""}
              />
              {errors.botName && (
                <p className="text-sm text-destructive">{errors.botName}</p>
              )}
            </div>
          </div>
        </div>

        {/* URL Configuration */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">URL Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "botFatherUrl",
                label: "Bot Father Service URL",
                placeholder: "http://localhost:8081",
              },
              {
                key: "botHubUrl",
                label: "Hub URL (Access From Bot)",
                placeholder: "http://host.containers.internal:1366/meetingHub",
              },
              {
                key: "hubUrl",
                label: "Hub URL (Access From Extension)",
                placeholder: "http://localhost:1366/meetingHub",
              },
              {
                key: "serviceBaseUrl",
                label: "Service Base URL (Access From Extension)",
                placeholder: "http://localhost:1366",
              },
              {
                key: "panelUrl",
                label: "Panel URL",
                placeholder: "http://localhost:3001",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-4">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={configs[key as keyof SystemConfigs] as string}
                  onChange={(e) =>
                    handleInputChange(
                      key as keyof SystemConfigs,
                      e.target.value,
                    )
                  }
                  placeholder={placeholder}
                  className={
                    errors[key as keyof SystemConfigs]
                      ? "border-destructive"
                      : ""
                  }
                />
                {errors[key as keyof SystemConfigs] && (
                  <p className="text-sm text-destructive">
                    {errors[key as keyof SystemConfigs]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* URL Configuration */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">SMTP Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "smtpHost",
                label: "SMTP Host",
                placeholder: "http://localhost:8081",
              },
              {
                key: "smtpPort",
                label: "SMTP Port",
                placeholder: "25",
              },
              {
                key: "smtpUser",
                label: "SMTP User",
                placeholder: "test@example.com",
              },
              {
                key: "smtpPassword",
                label: "SMTP Password",
                placeholder: "",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-4">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={configs[key as keyof SystemConfigs] as string}
                  onChange={(e) =>
                    handleInputChange(
                      key as keyof SystemConfigs,
                      e.target.value,
                    )
                  }
                  placeholder={placeholder}
                  className={
                    errors[key as keyof SystemConfigs]
                      ? "border-destructive"
                      : ""
                  }
                />
                {errors[key as keyof SystemConfigs] && (
                  <p className="text-sm text-destructive">
                    {errors[key as keyof SystemConfigs]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Localization */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">Localization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label htmlFor="direction">Text Direction</Label>
              <Select
                value={configs.direction}
                onValueChange={(value) =>
                  handleInputChange("direction", value)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                  <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label htmlFor="language">Language</Label>
              <Select
                value={configs.language}
                onValueChange={(value) => handleInputChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="af-ZA">
                    Afrikaans (South Africa)
                  </SelectItem>
                  <SelectItem value="sq-AL">Albanian (Albania)</SelectItem>
                  <SelectItem value="am-ET">Amharic (Ethiopia)</SelectItem>
                  <SelectItem value="ar-AE">Arabic (Arab Emirates)</SelectItem>
                  <SelectItem value="ar-EG">Arabic (Egypt)</SelectItem>
                  <SelectItem value="ar-x-LEVANT">Arabic (Levant)</SelectItem>
                  <SelectItem value="ar-x-MAGHREBI">
                    Arabic (Maghrebi)
                  </SelectItem>
                  <SelectItem value="hy-AM">Armenian</SelectItem>
                  <SelectItem value="az-AZ">
                    Azerbaijani (Azerbaijan) BETA
                  </SelectItem>
                  <SelectItem value="eu-ES">Basque</SelectItem>
                  <SelectItem value="bn-BD">Bengali (Bangladesh)</SelectItem>
                  <SelectItem value="bg-BG">Bulgarian (Bulgaria)</SelectItem>
                  <SelectItem value="my-MM">Burmese (Myanmar)</SelectItem>
                  <SelectItem value="ca-ES">Catalan (Spain)</SelectItem>
                  <SelectItem value="cmn-Hans-CN">
                    Chinese, Mandarin (Simplified)
                  </SelectItem>
                  <SelectItem value="cmn-Hant-TW">
                    Chinese, Mandarin (Traditional)
                  </SelectItem>
                  <SelectItem value="cs-CZ">Czech (Czechia) BETA</SelectItem>
                  <SelectItem value="da-DK">Danish (Denmark) BETA</SelectItem>
                  <SelectItem value="nl-BE">Dutch (Belgium) BETA</SelectItem>
                  <SelectItem value="nl-NL">Nederlands</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="en-CA">English (Canada)</SelectItem>
                  <SelectItem value="en-AU">English (Australian)</SelectItem>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="en-PH">English (Philippines)</SelectItem>
                  <SelectItem value="en-GB">
                    English (United Kingdom)
                  </SelectItem>
                  <SelectItem value="et-EE">Estonian (Estonia)</SelectItem>
                  <SelectItem value="fil-PH">Filipino (Philippines)</SelectItem>
                  <SelectItem value="fi-FI">Finnish (Finland)</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="fr-CA">French (Canada)</SelectItem>
                  <SelectItem value="gl-ES">Galician (Spain)</SelectItem>
                  <SelectItem value="ka-GE">Georgian (Georgia)</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="el-GR">Greek (Greece) BETA</SelectItem>
                  <SelectItem value="gu-IN">Gujarati (India)</SelectItem>
                  <SelectItem value="he-IL">Hebrew (Israel)</SelectItem>
                  <SelectItem value="hi-IN">Hindi</SelectItem>
                  <SelectItem value="hu-HU">Hungarian (Hungary)</SelectItem>
                  <SelectItem value="is-IS">
                    Icelandic (Iceland) BETA
                  </SelectItem>
                  <SelectItem value="id-ID">Indonesian (Indonesia)</SelectItem>
                  <SelectItem value="it-IT">Italiano</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                  <SelectItem value="jv-ID">Javanese (Indonesia)</SelectItem>
                  <SelectItem value="kn-IN">Kannada (India)</SelectItem>
                  <SelectItem value="kk-KZ">
                    Kazakh (Kazakhstan) BETA
                  </SelectItem>
                  <SelectItem value="km-KH">Khmer (Cambodia)</SelectItem>
                  <SelectItem value="rw-RW">Kinyarwanda (Rwanda)</SelectItem>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                  <SelectItem value="lo-LA">Lao (Laos) BETA</SelectItem>
                  <SelectItem value="lt-LT">
                    Lithuanian (Lithuania) BETA
                  </SelectItem>
                  <SelectItem value="lv-LV">Latvian (Latvia)</SelectItem>
                  <SelectItem value="mk-MK">
                    Macedonian (North Macedonia)
                  </SelectItem>
                  <SelectItem value="ms-MY">Malay (Malaysia)</SelectItem>
                  <SelectItem value="ml-IN">Malayalam (India)</SelectItem>
                  <SelectItem value="mn-MN">Mongolian (Mongolia)</SelectItem>
                  <SelectItem value="ne-NP">Nepali (Nepal)</SelectItem>
                  <SelectItem value="nso-ZA">
                    Northern Sotho (South Africa)
                  </SelectItem>
                  <SelectItem value="nb-NO">Norwegian (Norway)</SelectItem>
                  <SelectItem value="fa-IR">Persian (Iran)</SelectItem>
                  <SelectItem value="pl-PL">Polski</SelectItem>
                  <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                  <SelectItem value="pt-PT">Portuguese (Portugal)</SelectItem>
                  <SelectItem value="ro-RO">Romanian (Romania)</SelectItem>
                  <SelectItem value="ru-RU">Russian</SelectItem>
                  <SelectItem value="sr-RS">Serbian (Serbia) BETA</SelectItem>
                  <SelectItem value="st-ZA">Sesotho (South Africa)</SelectItem>
                  <SelectItem value="si-LK">Sinhala (Sri Lanka)</SelectItem>
                  <SelectItem value="sk-SK">Slovak (Slovakia)</SelectItem>
                  <SelectItem value="sl-SI">Slovenian (Slovenia)</SelectItem>
                  <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                  <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                  <SelectItem value="su-ID">Sundanese (Indonesia)</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="ss-latn-ZA">
                    Swati (South Africa)
                  </SelectItem>
                  <SelectItem value="sv-SE">Swedish (Sweden)</SelectItem>
                  <SelectItem value="ta-IN">Tamil (India)</SelectItem>
                  <SelectItem value="te-IN">Telugu (India)</SelectItem>
                  <SelectItem value="th-TH">ไทย (Thai)</SelectItem>
                  <SelectItem value="tn-latn-ZA">
                    Tswana (South Africa)
                  </SelectItem>
                  <SelectItem value="tr-TR">Türkçe (Turkey)</SelectItem>
                  <SelectItem value="uk-UA">
                    Ukrainian (Ukraine) BETA
                  </SelectItem>
                  <SelectItem value="ur-PK">Urdu (Pakistan)</SelectItem>
                  <SelectItem value="uz-UZ">Uzbek (Uzbekistan) BETA</SelectItem>
                  <SelectItem value="vi-VN">Tiếng Việt (Vietnam)</SelectItem>
                  <SelectItem value="xh-ZA">Xhosa (South Africa)</SelectItem>
                  <SelectItem value="ts-ZA">Xitsonga (South Africa)</SelectItem>
                  <SelectItem value="zu-ZA">Zulu (South Africa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* API Tokens */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">API Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openaiToken">OpenAI Token</Label>
              <Input
                id="openaiToken"
                type="password"
                value={configs.openAIToken}
                onChange={(e) => handleInputChange("openAIToken", e.target.value)}
                placeholder="Enter your OpenAI API token"
                className={errors.openAIToken ? "border-destructive" : ""}
              />
              {errors.openAIToken && (
                <p className="text-sm text-destructive">{errors.openAIToken}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="openaiProxyUrl">OpenAI Proxy URL (Optional)</Label>
              <Input
                id="openaiProxyUrl"
                type="url"
                value={configs.openAIProxyUrl}
                onChange={(e) => handleInputChange("openAIProxyUrl", e.target.value)}
                placeholder="https://your-proxy-domain.com"
                className={errors.openAIProxyUrl ? "border-destructive" : ""}
              />
              {errors.openAIProxyUrl && (
                <p className="text-sm text-destructive">{errors.openAIProxyUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Meeting configs */}
        <div className="space-y-4">
          <h2 className="text-xl mt-8 font-semibold">Meeting Configuration</h2>

          <div className="space-y-2">
            <Label htmlFor="transcriptionModel">Transcription Model</Label>
            <Select
              value={configs.meetingTranscriptionModel}
              onValueChange={(value) =>
                handleInputChange("meetingTranscriptionModel", value)
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="liveCaption">Live Caption</SelectItem>
                <SelectItem value="whisper">Whisper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Auto-Leave Timeouts (milliseconds)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "autoLeaveWaitingEnter",
                  label: "Waiting to Enter",
                  description: "Time before leaving waiting room",
                },
                {
                  key: "autoLeaveNoParticipant",
                  label: "No Participants",
                  description: "Time before leaving empty meeting",
                },
                {
                  key: "autoLeaveAllParticipantsLeft",
                  label: "All Left",
                  description: "Time after all participants leave",
                },
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    min="1000"
                    max="300000"
                    step="1000"
                    value={configs[key as keyof SystemConfigs] as number}
                    onChange={(e) =>
                      handleInputChange(
                        key as keyof SystemConfigs,
                        Number.parseInt(e.target.value),
                      )
                    }
                    className={
                      errors[key as keyof SystemConfigs]
                        ? "border-destructive"
                        : ""
                    }
                  />
                  <p className="text-xs text-muted-foreground">{description}</p>
                  {errors[key as keyof SystemConfigs] && (
                    <p className="text-sm text-destructive">
                      {errors[key as keyof SystemConfigs]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Recording & Transcription</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "meetingVideoRecording",
                  label: "Video Recording",
                  description: "Enable video recording for meetings",
                },
                {
                  key: "meetingAudioRecording",
                  label: "Audio Recording",
                  description: "Enable audio recording for meetings",
                },
                {
                  key: "meetingTranscription",
                  label: "Meeting Transcription",
                  description: "Enable real-time transcription",
                },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={configs[key as keyof SystemConfigs] as boolean}
                    onCheckedChange={(checked) =>
                      handleInputChange(key as keyof SystemConfigs, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 pb-6 border-t">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={!hasConfigsChanged()}>
          Save Configs
        </Button>
      </div>
    </div>
  );
}
