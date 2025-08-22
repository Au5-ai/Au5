"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import BreadcrumbLayout from "@/components/breadcrumb-layout";
import { Separator } from "@/components/ui/separator";
import { SystemSettings } from "@/type";
import { validateUrl } from "@/lib/utils";

const defaultSettings: SystemSettings = {
  OrganizationName: "",
  BotName: "",
  BotFatherUrl: "",
  BotHubUrl: "",
  HubUrl: "",
  ServiceBaseUrl: "",
  PanelUrl: "",
  Direction: "rtl",
  Language: "fa-IR",
  OpenAIToken: "",
  MeetingTranscriptionModel: "liveCaption",
  AutoLeaveWaitingEnter: 30000,
  AutoLeaveNoParticipant: 60000,
  AutoLeaveAllParticipantsLeft: 120000,
  MeetingVideoRecording: false,
  MeetingAudioRecording: false,
  MeetingTranscription: true,
};

export default function SystemConfigPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const [errors, setErrors] = useState<
    Partial<Record<keyof SystemSettings, string>>
  >({});

  const validateField = (
    field: keyof SystemSettings,
    value: any
  ): string | null => {
    switch (field) {
      case "OrganizationName":
      case "BotName":
        return !value || value.trim().length < 2
          ? "Must be at least 2 characters"
          : null;

      case "BotFatherUrl":
      case "BotHubUrl":
      case "HubUrl":
      case "ServiceBaseUrl":
      case "PanelUrl":
        return !validateUrl(value) ? "Must be a valid URL" : null;

      case "OpenAIToken":
        return !value || value.trim().length < 10
          ? "Token must be at least 10 characters"
          : null;

      case "AutoLeaveWaitingEnter":
      case "AutoLeaveNoParticipant":
      case "AutoLeaveAllParticipantsLeft":
        return value < 1000 || value > 300000
          ? "Must be between 1000 and 300000 milliseconds"
          : null;

      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSave = () => {
    const newErrors: Partial<Record<keyof SystemSettings, string>> = {};

    Object.entries(settings).forEach(([key, value]) => {
      const error = validateField(key as keyof SystemSettings, value);
      if (error) {
        newErrors[key as keyof SystemSettings] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      toast.success("Your system settings have been updated successfully.");
    } else {
      toast.error("Please fix the errors before saving.");
    }
  };

  const handleReset = () => {
    setErrors({});
    toast.info("All settings have been reset to default values.");
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbLayout />
        </div>
        <div className="ml-auto px-4">
          {/* Render a component passed from children via a prop */}
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto p-2 px-4">
          <h1 className="text-2xl font-bold mb-1">System Settings</h1>
          <p className="text-muted-foreground">
            Configure your bot and meeting system parameters
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8 pt-6">
          <div className="space-y-8">
            {/* Organization Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Organization & Bot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={settings.OrganizationName}
                    onChange={(e) =>
                      handleInputChange("OrganizationName", e.target.value)
                    }
                    className={
                      errors.OrganizationName ? "border-destructive" : ""
                    }
                  />
                  {errors.OrganizationName && (
                    <p className="text-sm text-destructive">
                      {errors.OrganizationName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    value={settings.BotName}
                    onChange={(e) =>
                      handleInputChange("BotName", e.target.value)
                    }
                    className={errors.BotName ? "border-destructive" : ""}
                  />
                  {errors.BotName && (
                    <p className="text-sm text-destructive">{errors.BotName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* URL Configuration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">URL Configuration</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    key: "BotFatherUrl",
                    label: "Bot Father Service URL",
                    placeholder: "http://localhost:8081",
                  },
                  {
                    key: "BotHubUrl",
                    label: "Hub URL (Access From Bot)",
                    placeholder:
                      "http://host.containers.internal:1366/meetingHub",
                  },
                  {
                    key: "HubUrl",
                    label: "Hub URL (Access From Extension)",
                    placeholder: "http://localhost:1366/meetingHub",
                  },
                  {
                    key: "ServiceBaseUrl",
                    label: "Service Base URL (Access From Extension)",
                    placeholder: "http://localhost:1366",
                  },
                  {
                    key: "PanelUrl",
                    label: "Panel URL",
                    placeholder: "http://localhost:3001",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-4">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      value={settings[key as keyof SystemSettings] as string}
                      onChange={(e) =>
                        handleInputChange(
                          key as keyof SystemSettings,
                          e.target.value
                        )
                      }
                      placeholder={placeholder}
                      className={
                        errors[key as keyof SystemSettings]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[key as keyof SystemSettings] && (
                      <p className="text-sm text-destructive">
                        {errors[key as keyof SystemSettings]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Localization */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Localization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="direction">Text Direction</Label>
                  <Select
                    value={settings.Direction}
                    onValueChange={(value) =>
                      handleInputChange("Direction", value)
                    }
                  >
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
                    value={settings.Language}
                    onValueChange={(value) =>
                      handleInputChange("Language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="af-ZA">
                        Afrikaans (South Africa)
                      </SelectItem>
                      <SelectItem value="sq-AL">Albanian (Albania)</SelectItem>
                      <SelectItem value="am-ET">Amharic (Ethiopia)</SelectItem>
                      <SelectItem value="ar-AE">
                        Arabic (Arab Emirates)
                      </SelectItem>
                      <SelectItem value="ar-EG">Arabic (Egypt)</SelectItem>
                      <SelectItem value="ar-x-LEVANT">
                        Arabic (Levant)
                      </SelectItem>
                      <SelectItem value="ar-x-MAGHREBI">
                        Arabic (Maghrebi)
                      </SelectItem>
                      <SelectItem value="hy-AM">Armenian</SelectItem>
                      <SelectItem value="az-AZ">
                        Azerbaijani (Azerbaijan) BETA
                      </SelectItem>
                      <SelectItem value="eu-ES">Basque</SelectItem>
                      <SelectItem value="bn-BD">
                        Bengali (Bangladesh)
                      </SelectItem>
                      <SelectItem value="bg-BG">
                        Bulgarian (Bulgaria)
                      </SelectItem>
                      <SelectItem value="my-MM">Burmese (Myanmar)</SelectItem>
                      <SelectItem value="ca-ES">Catalan (Spain)</SelectItem>
                      <SelectItem value="cmn-Hans-CN">
                        Chinese, Mandarin (Simplified)
                      </SelectItem>
                      <SelectItem value="cmn-Hant-TW">
                        Chinese, Mandarin (Traditional)
                      </SelectItem>
                      <SelectItem value="cs-CZ">
                        Czech (Czechia) BETA
                      </SelectItem>
                      <SelectItem value="da-DK">
                        Danish (Denmark) BETA
                      </SelectItem>
                      <SelectItem value="nl-BE">
                        Dutch (Belgium) BETA
                      </SelectItem>
                      <SelectItem value="nl-NL">Nederlands</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="en-CA">English (Canada)</SelectItem>
                      <SelectItem value="en-AU">
                        English (Australian)
                      </SelectItem>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-PH">
                        English (Philippines)
                      </SelectItem>
                      <SelectItem value="en-GB">
                        English (United Kingdom)
                      </SelectItem>
                      <SelectItem value="et-EE">Estonian (Estonia)</SelectItem>
                      <SelectItem value="fil-PH">
                        Filipino (Philippines)
                      </SelectItem>
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
                      <SelectItem value="id-ID">
                        Indonesian (Indonesia)
                      </SelectItem>
                      <SelectItem value="it-IT">Italiano</SelectItem>
                      <SelectItem value="ja-JP">日本語</SelectItem>
                      <SelectItem value="jv-ID">
                        Javanese (Indonesia)
                      </SelectItem>
                      <SelectItem value="kn-IN">Kannada (India)</SelectItem>
                      <SelectItem value="kk-KZ">
                        Kazakh (Kazakhstan) BETA
                      </SelectItem>
                      <SelectItem value="km-KH">Khmer (Cambodia)</SelectItem>
                      <SelectItem value="rw-RW">
                        Kinyarwanda (Rwanda)
                      </SelectItem>
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
                      <SelectItem value="mn-MN">
                        Mongolian (Mongolia)
                      </SelectItem>
                      <SelectItem value="ne-NP">Nepali (Nepal)</SelectItem>
                      <SelectItem value="nso-ZA">
                        Northern Sotho (South Africa)
                      </SelectItem>
                      <SelectItem value="nb-NO">Norwegian (Norway)</SelectItem>
                      <SelectItem value="fa-IR">Persian (Iran)</SelectItem>
                      <SelectItem value="pl-PL">Polski</SelectItem>
                      <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                      <SelectItem value="pt-PT">
                        Portuguese (Portugal)
                      </SelectItem>
                      <SelectItem value="ro-RO">Romanian (Romania)</SelectItem>
                      <SelectItem value="ru-RU">Russian</SelectItem>
                      <SelectItem value="sr-RS">
                        Serbian (Serbia) BETA
                      </SelectItem>
                      <SelectItem value="st-ZA">
                        Sesotho (South Africa)
                      </SelectItem>
                      <SelectItem value="si-LK">Sinhala (Sri Lanka)</SelectItem>
                      <SelectItem value="sk-SK">Slovak (Slovakia)</SelectItem>
                      <SelectItem value="sl-SI">
                        Slovenian (Slovenia)
                      </SelectItem>
                      <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                      <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                      <SelectItem value="su-ID">
                        Sundanese (Indonesia)
                      </SelectItem>
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
                      <SelectItem value="uz-UZ">
                        Uzbek (Uzbekistan) BETA
                      </SelectItem>
                      <SelectItem value="vi-VN">
                        Tiếng Việt (Vietnam)
                      </SelectItem>
                      <SelectItem value="xh-ZA">
                        Xhosa (South Africa)
                      </SelectItem>
                      <SelectItem value="ts-ZA">
                        Xitsonga (South Africa)
                      </SelectItem>
                      <SelectItem value="zu-ZA">Zulu (South Africa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* API Tokens */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">API Tokens</h2>
              <div className="space-y-2">
                <Label htmlFor="openaiToken">OpenAI Token</Label>
                <Input
                  id="openaiToken"
                  type="password"
                  value={settings.OpenAIToken}
                  onChange={(e) =>
                    handleInputChange("OpenAIToken", e.target.value)
                  }
                  placeholder="Enter your OpenAI API token"
                  className={errors.OpenAIToken ? "border-destructive" : ""}
                />
                {errors.OpenAIToken && (
                  <p className="text-sm text-destructive">
                    {errors.OpenAIToken}
                  </p>
                )}
              </div>
            </div>

            {/* Meeting Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Meeting Configuration</h2>

              <div className="space-y-2">
                <Label htmlFor="transcriptionModel">Transcription Model</Label>
                <Select
                  value={settings.MeetingTranscriptionModel}
                  onValueChange={(value) =>
                    handleInputChange("MeetingTranscriptionModel", value)
                  }
                >
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
                <h3 className="font-medium">
                  Auto-Leave Timeouts (milliseconds)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "AutoLeaveWaitingEnter",
                      label: "Waiting to Enter",
                      description: "Time before leaving waiting room",
                    },
                    {
                      key: "AutoLeaveNoParticipant",
                      label: "No Participants",
                      description: "Time before leaving empty meeting",
                    },
                    {
                      key: "AutoLeaveAllParticipantsLeft",
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
                        value={settings[key as keyof SystemSettings] as number}
                        onChange={(e) =>
                          handleInputChange(
                            key as keyof SystemSettings,
                            Number.parseInt(e.target.value)
                          )
                        }
                        className={
                          errors[key as keyof SystemSettings]
                            ? "border-destructive"
                            : ""
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                      {errors[key as keyof SystemSettings] && (
                        <p className="text-sm text-destructive">
                          {errors[key as keyof SystemSettings]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Recording & Transcription</h3>
                <div className="space-y-4">
                  {[
                    {
                      key: "MeetingVideoRecording",
                      label: "Video Recording",
                      description: "Enable video recording for meetings",
                    },
                    {
                      key: "MeetingAudioRecording",
                      label: "Audio Recording",
                      description: "Enable audio recording for meetings",
                    },
                    {
                      key: "MeetingTranscription",
                      label: "Meeting Transcription",
                      description: "Enable real-time transcription",
                    },
                  ].map(({ key, label, description }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <Label htmlFor={key}>{label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <Switch
                        id={key}
                        checked={
                          settings[key as keyof SystemSettings] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            key as keyof SystemSettings,
                            checked
                          )
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
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
