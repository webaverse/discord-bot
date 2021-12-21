export interface IHelpCommand {
  name: string;
  shortname: string;
  commands: [string, Array<string>, string][];
}
