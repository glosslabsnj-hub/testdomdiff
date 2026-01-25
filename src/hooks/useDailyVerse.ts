import { useMemo } from "react";

interface DailyVerse {
  reference: string;
  text: string;
  theme: string;
}

// Curated scripture library for daily rotation
const SCRIPTURE_LIBRARY: DailyVerse[] = [
  // Discipline & Strength
  { reference: "1 Corinthians 9:27", text: "I discipline my body and keep it under control.", theme: "discipline" },
  { reference: "Proverbs 25:28", text: "A man without self-control is like a city broken into and left without walls.", theme: "discipline" },
  { reference: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control.", theme: "strength" },
  { reference: "Isaiah 40:31", text: "They who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.", theme: "strength" },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", theme: "strength" },
  
  // Perseverance & Endurance
  { reference: "James 1:12", text: "Blessed is the man who remains steadfast under trial.", theme: "perseverance" },
  { reference: "Romans 5:3-4", text: "Suffering produces endurance, and endurance produces character, and character produces hope.", theme: "perseverance" },
  { reference: "Hebrews 12:1", text: "Let us run with endurance the race that is set before us.", theme: "perseverance" },
  { reference: "Galatians 6:9", text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up.", theme: "perseverance" },
  
  // Transformation & New Life
  { reference: "Romans 12:2", text: "Be transformed by the renewal of your mind.", theme: "transformation" },
  { reference: "2 Corinthians 5:17", text: "If anyone is in Christ, he is a new creation. The old has passed away; the new has come.", theme: "transformation" },
  { reference: "Ezekiel 36:26", text: "I will give you a new heart and put a new spirit in you.", theme: "transformation" },
  { reference: "Ephesians 4:22-24", text: "Put off your old self... and put on the new self, created after the likeness of God.", theme: "transformation" },
  
  // Purpose & Calling
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", theme: "purpose" },
  { reference: "Proverbs 19:21", text: "Many are the plans in the mind of a man, but it is the purpose of the Lord that will stand.", theme: "purpose" },
  { reference: "Ephesians 2:10", text: "For we are his workmanship, created in Christ Jesus for good works.", theme: "purpose" },
  
  // Courage & Fear
  { reference: "Joshua 1:9", text: "Be strong and courageous. Do not be frightened, for the Lord your God is with you wherever you go.", theme: "courage" },
  { reference: "Psalm 27:1", text: "The Lord is my light and my salvation—whom shall I fear?", theme: "courage" },
  { reference: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God.", theme: "courage" },
  
  // Brotherhood & Community
  { reference: "Proverbs 27:17", text: "As iron sharpens iron, so one man sharpens another.", theme: "brotherhood" },
  { reference: "Ecclesiastes 4:9-10", text: "Two are better than one... For if they fall, one will lift up his fellow.", theme: "brotherhood" },
  { reference: "Hebrews 10:24", text: "Let us consider how to stir up one another to love and good works.", theme: "brotherhood" },
  
  // Work & Hustle
  { reference: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men.", theme: "work" },
  { reference: "Proverbs 14:23", text: "In all toil there is profit, but mere talk tends only to poverty.", theme: "work" },
  { reference: "Proverbs 12:11", text: "Whoever works his land will have plenty of bread.", theme: "work" },
  
  // Redemption & Freedom
  { reference: "Galatians 5:1", text: "For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery.", theme: "freedom" },
  { reference: "John 8:36", text: "So if the Son sets you free, you will be free indeed.", theme: "freedom" },
  { reference: "Isaiah 43:18-19", text: "Forget the former things; do not dwell on the past. See, I am doing a new thing!", theme: "redemption" },
  { reference: "Psalm 103:12", text: "As far as the east is from the west, so far has he removed our transgressions from us.", theme: "redemption" },
];

export function useDailyVerse() {
  const verse = useMemo(() => {
    // Use date to deterministically select a verse (rotates daily)
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Use day of year to index into scripture library
    const index = dayOfYear % SCRIPTURE_LIBRARY.length;
    return SCRIPTURE_LIBRARY[index];
  }, []);

  return {
    verse,
    allVerses: SCRIPTURE_LIBRARY,
  };
}
