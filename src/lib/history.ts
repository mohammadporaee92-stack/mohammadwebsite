import { History, Articles } from "./db";

export async function recordHistory(input: {
  userId: string;
  targetType: string;
  targetId: string;
  title: string;
  url: string;
}) {
  try {
    History.add(input);
  } catch {
    // history must never break page rendering
  }
}

export async function bumpViews(articleId: string) {
  try {
    Articles.incViews(articleId);
  } catch {
    /* ignore */
  }
}
