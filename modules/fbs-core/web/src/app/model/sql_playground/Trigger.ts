export interface Trigger {
  name: string;
  event: TriggerEvent;
  action: TriggerAction;
}

interface TriggerEvent {
  manipulation: string;
  objecttable: string;
}

interface TriggerAction {
  statement: string;
  orientation: string;
  timing: string;
}
