type CommandFunction = () => void;

export class Subscription {
    constructor(readonly commandId: string, readonly action: CommandFunction) {}
}