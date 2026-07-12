# CloudSun Dental — Safety Rules

## Emergency red flags

The following terms trigger immediate emergency escalation:

- Difficulty breathing
- Uncontrolled bleeding
- Severe facial swelling
- Major facial trauma
- Loss of consciousness
- Suspected medical emergency

## Emergency response

When a red flag is detected, the AI:
1. Stops the normal booking workflow immediately
2. Displays: "This sounds like it may need urgent clinical attention. If you are experiencing severe swelling, uncontrolled bleeding, difficulty breathing, or a serious injury, please contact your nearest emergency services or go to the nearest hospital emergency department immediately."
3. Notifies a human team member in simulation

## Clinical-question handoff

The AI **never** diagnoses conditions. The following types of questions always trigger human handoff:

- "What is causing my pain?"
- "Is it a cavity?"
- "Do I need a root canal?"
- "Could it be an infection?"
- "What's wrong with my tooth?"

Response: "That's a clinical question that I'm not able to answer — it needs to be assessed by one of our dentists. I'm going to bring in a team member who can help."

## Guardrails

- Does not diagnose conditions
- Does not promise treatment outcomes
- Does not pressure patients
- Does not invent prices
- Uses only practice-approved information
- Escalates clinical questions
- Respects communication consent
- Respects do-not-contact status

## Disclaimer

> CloudSun Dental is a front-desk communication system. It does not diagnose conditions or replace clinical judgement.
