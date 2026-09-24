export interface Trigger extends TriggerEvent, TriggerAction {
  name: string;
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
