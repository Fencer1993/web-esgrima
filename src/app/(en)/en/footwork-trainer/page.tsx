import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FootworkTrainer } from "@/components/FootworkTrainer";
import { pageAlternates } from "@/content/i18n";

export const metadata: Metadata = {
  title: "Voice footwork trainer",
  description:
    "Train your fencing footwork at home: your phone calls out advances, retreats and lunges at random, with rounds, rests and a colour-based reaction mode.",
  alternates: pageAlternates("/en/footwork-trainer"),
};

export default function FootworkTrainerEn() {
  return (
    <>
      <PageHero
        path="/en/footwork-trainer"
        eyebrow="Train at home"
        title="Voice footwork trainer"
        lede="Your phone calls out random commands (“On guard!… advance… retreat… lunge!”) and you work your feet. No sign-up, and nothing is stored."
        lang="en"
      />
      <Section>
        <FootworkTrainer lang="en" />
        <div className="mt-12 max-w-2xl text-sm leading-relaxed text-ink-soft">
          <h2 className="text-lg font-bold uppercase tracking-tight text-ink">How it works</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Choose the level, the rounds and the rest, then press “Start”. After the countdown, your phone’s voice calls the commands.</li>
            <li>The command also appears in large type on screen, so you can train with the sound off or if you are hard of hearing.</li>
            <li>It keeps count of your steps and never sends you more than 6 steps either way: a hallway is enough.</li>
            <li>Commands can be in Spanish, French (the language of fencing) or English.</li>
            <li>Reaction mode uses no voice: the screen changes colour and each colour is a command.</li>
            <li>Once loaded, the page works offline. The screen stays on while you train, if your phone allows it.</li>
          </ul>
        </div>
      </Section>
    </>
  );
}
