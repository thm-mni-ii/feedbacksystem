# Feedbackssystem Helm Chart

## Setup

1. Prepare Kubernetes + Helm
2. Add Repository
3. Generate values `deno run --reload=https://raw.githubusercontent.com https://raw.githubusercontent.com/thm-mni-ii/feedbacksystem/dev/chart/generate-values.ts --allow-write=vals.yaml vals.yaml`
4. Install `helm install -n <namepsace> --create-namespace -f values.yaml feedbacksystem feedbackssystem/feedbacksystem`
