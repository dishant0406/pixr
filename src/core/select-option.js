import readline from "node:readline";

export async function selectOption(options, config) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Interactive selection requires a TTY.");
  }
  if (options.length === 0) {
    throw new Error("No options available.");
  }

  const currentIndex = findCurrentIndex(options, config.currentValue);
  let index = currentIndex === -1 ? 0 : currentIndex;

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  render(options, index, config);

  try {
    return await new Promise((resolve) => {
      const onKeypress = (_, key = {}) => {
        if (key.name === "up") {
          index = index === 0 ? options.length - 1 : index - 1;
          render(options, index, config);
          return;
        }
        if (key.name === "down") {
          index = index === options.length - 1 ? 0 : index + 1;
          render(options, index, config);
          return;
        }
        if (key.name === "return") {
          cleanup();
          resolve(options[index]);
          return;
        }
        if (key.name === "escape" || key.name === "q" || (key.ctrl && key.name === "c")) {
          cleanup();
          resolve(null);
        }
      };

      function cleanup() {
        process.stdin.off("keypress", onKeypress);
        if (process.stdin.isRaw) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
        process.stdout.write("\n");
      }

      process.stdin.on("keypress", onKeypress);
    });
  } finally {
    if (process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }
  }
}

function render(options, index, config) {
  const lines = [
    config.title,
    "Use arrow keys. Press Enter to save. Press q or Esc to cancel.",
    "",
    ...options.map((option, optionIndex) => formatOption(option, optionIndex === index, config.currentValue)),
  ];

  process.stdout.write("\x1Bc");
  process.stdout.write(`${lines.join("\n")}\n`);
}

function formatOption(option, active, currentValue) {
  const pointer = active ? ">" : " ";
  const current = option.value === currentValue ? " current" : "";
  const detail = option.detail ? ` - ${option.detail}` : "";
  return `${pointer} ${option.label}${detail}${current}`;
}

function findCurrentIndex(options, currentValue) {
  return options.findIndex((option) => option.value === currentValue);
}
