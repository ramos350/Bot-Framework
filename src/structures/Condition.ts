import Result from "#lib/Result";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";

export abstract class Condition {
    abstract messageRun(msg: Message): Result | Promise<Result>;
    abstract chatInputRun(ctx: ChatInputCommandInteraction): Result | Promise<Result>;
    abstract contextMenuRun(ctx: ContextMenuCommandInteraction): Result | Promise<Result>;
  }
  