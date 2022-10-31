{{- define "host" -}}
{{ print .Values.common.config.protocol "//" .Values.common.config.hostname ":" .Values.common.config.port }}
{{- end -}}
