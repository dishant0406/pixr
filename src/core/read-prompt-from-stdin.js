export async function readPromptFromStdin() {
  if (process.stdin.isTTY) {
    return "";
  }

  let input = "";
  process.stdin.setEncoding("utf8");

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  return input.trim();
}
