import sys
sys.path.insert(0, r'n:\RealVeritas AI')
from text.services.text_verifier import TextVerifier
tv = TextVerifier()
texts = {
  'human_1': "Hey! So I just wanted to quickly write down some thoughts about the new project we discussed yesterday. Honestly? I think it is a bit too ambitious. We do not have enough time. The deadline is literally next week! I know Sarah said she could help, but she is already swamped with the marketing campaign stuff. Also, the budget seems really tight for what we are trying to achieve here. Anyway, let me know what you think when you get a chance. Maybe we can grab a coffee later and hash it out properly? I really want to make this work, but we need to be realistic about our goals.",
  'ai_1': "Artificial intelligence refers to the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. Particular applications of AI include expert systems, speech recognition, and machine vision. AI can be categorized as either weak or strong. Weak AI, also known as narrow AI, is an AI system that is designed and trained for a particular task. Strong AI, also known as artificial general intelligence, is an AI system with generalized human cognitive abilities.",
  'ai_2': "As an AI language model, I do not have personal feelings, opinions, or beliefs. However, I can provide objective information on the subject. The rapid advancement of artificial intelligence technologies has significantly transformed various industries across the globe. Furthermore, it is essential to mitigate the potential risks associated with these rapid deployments. Moreover, organizations must not only adapt to these changes but also proactively integrate new systems into their existing workflows. Consequently, the overall efficiency of business operations has experienced a notable increase in recent years."
}
for name, t in texts.items():
  res = tv.verify_text(t)
  print(f"{name}: {res['classification']} (confidence {res['confidence']}, words {len(t.split())})")
