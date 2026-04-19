/**
 * Photon iMessage delivery client.
 *
 * Uses macOS AppleScript to send iMessages directly through the local
 * Messages.app. This avoids external service dependencies and works
 * out of the box on any Mac signed into iMessage.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/**
 * Send an iMessage via macOS Messages.app (AppleScript).
 */
export async function sendIMessage(
  phoneNumber: string,
  subject: string,
  body: string
): Promise<void> {
  const message = subject ? `${subject}\n\n${body}` : body;
  await sendViaAppleScript(phoneNumber, message);
}

/**
 * Send with a small delay to simulate typing for a more natural feel.
 */
export async function sendIMessageWithTyping(
  phoneNumber: string,
  subject: string,
  body: string
): Promise<void> {
  const message = subject ? `✈️ ${subject}\n\n${body}` : body;
  // Brief pause to feel like a real message, not an instant bot reply
  await new Promise((r) => setTimeout(r, 1500));
  await sendViaAppleScript(phoneNumber, message);
}

async function sendViaAppleScript(
  phoneNumber: string,
  message: string
): Promise<void> {
  // Normalize phone number to E.164-ish format
  const normalized = phoneNumber.replace(/[\s\-\(\)]/g, "");
  const target = normalized.startsWith("+") ? normalized : `+1${normalized}`;

  // Escape for AppleScript string literal
  const escaped = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const script = `
tell application "Messages"
  set targetService to 1st account whose service type = iMessage
  set targetBuddy to participant "${target}" of targetService
  send "${escaped}" to targetBuddy
end tell`;

  await exec("osascript", ["-e", script]);
}
