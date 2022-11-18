export interface Trigger {
    name: string;
    action: TriggerAction;
    event: TriggerEvent;
}

export interface TriggerAction {
    statement: string;
    orientation: string;
    timing: string;
}

export interface TriggerEvent {
    manipulation: string;
    objectTable: string;
}