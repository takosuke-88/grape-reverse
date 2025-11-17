#!/usr/bin/env node
import { Command } from "commander";
import { z, ZodError } from "zod";
import { reverseGrape } from "./lib/reverse.js";

const program = new Command();

program
  .name("grape-rev")
  .description("ジャグラーの推定ぶどう回数・ぶどう確率を逆算するCLI")
  .requiredOption("--coins <number>", "投入枚数（必須）")
  .requiredOption("--bonus <number>", "ボーナス払い出し合計（必須）")
  .option("--cherry <number>", "チェリー払い出し合計（任意）")
  .option("--payout <number>", "ぶどう1回の払い出し（既定: 7）", "7")
  .showHelpAfterError();

program.action(() => {
  const schema = z.object({
    coins: z.coerce.number().int().nonnegative(),
    bonus: z.coerce.number().int().nonnegative(),
    cherry: z.coerce.number().int().nonnegative().optional(),
    payout: z.coerce.number().positive(),
  });

  try {
    const { coins, bonus, cherry, payout } = schema.parse(program.opts());

    const result = reverseGrape({ coins, bonus, cherry, payout });

    console.log("―― 計算結果 ――");
    console.log(`投入枚数: ${coins}`);
    console.log(`ボーナス払い出し: ${bonus}`);
    if (cherry !== undefined) console.log(`チェリー払い出し(推定): ${cherry}`);
    console.log(`推定ぶどう回数: ${result.grapeCount}`);
    console.log(`ぶどう確率: 1/${result.grapeProb}`);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("入力エラー:", e.issues.map(i => i.message).join(", "));
      process.exit(1);
    }
    throw e;
  }
});

program.parse();
