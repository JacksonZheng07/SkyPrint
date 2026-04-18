/**
 * Spectrum-ts client for Photon notification delivery via iMessage.
 * Singleton instance — lazily initialized on first use.
 */
import { Spectrum, text, type SpectrumInstance } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

let _spectrum: SpectrumInstance | null = null;
let _initPromise: Promise<SpectrumInstance> | null = null;

async function initSpectrum(): Promise<SpectrumInstance> {
  const projectId = process.env.PHOTON_PROJECT_ID;
  const projectSecret = process.env.PHOTON_PROJECT_SECRET;

  if (!projectId || !projectSecret) {
    throw new Error("PHOTON_PROJECT_ID and PHOTON_PROJECT_SECRET required");
  }

  const app = await Spectrum({
    projectId,
    projectSecret,
    providers: [imessage.config()],
  });

  return app;
}

export async function getSpectrumClient(): Promise<SpectrumInstance> {
  if (_spectrum) return _spectrum;
  if (!_initPromise) {
    _initPromise = initSpectrum().then((app) => {
      _spectrum = app;
      return app;
    });
  }
  return _initPromise;
}

/**
 * Send a notification to a user via iMessage through Spectrum.
 */
export async function sendIMessage(
  phoneNumber: string,
  subject: string,
  body: string
): Promise<void> {
  const app = await getSpectrumClient();
  const im = imessage(app);
  const user = await im.user(phoneNumber);
  const space = await im.space(user);

  const message = subject ? `${subject}\n\n${body}` : body;
  await space.send(text(message));
}

/**
 * Send a notification with typing indicator for a more natural feel.
 */
export async function sendIMessageWithTyping(
  phoneNumber: string,
  subject: string,
  body: string
): Promise<void> {
  const app = await getSpectrumClient();
  const im = imessage(app);
  const user = await im.user(phoneNumber);
  const space = await im.space(user);

  const message = subject ? `✈️ ${subject}\n\n${body}` : body;
  await space.responding(async () => {
    await space.send(text(message));
  });
}
