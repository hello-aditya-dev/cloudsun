# CloudSun Dental — Workflows

## New-patient intake

1. Patient calls/messages via phone, WhatsApp, email or website chat
2. AI discloses it is an automated assistant
3. AI screens for emergency red flags
4. If no red flags, AI collects: name, phone, new/existing, reason, preferred location, preferred dentist, preferred time
5. AI suggests appointment type from configured list
6. AI checks simulated availability
7. AI creates appointment request (or booking if permitted)
8. Confirmation message sent (simulated)
9. Conversation enters unified practice inbox

## Cancellation recovery

1. Appointment cancelled
2. Slot becomes available
3. Matching waitlist patients identified and ranked
4. Staff reviews candidates
5. Simulated invitation sent
6. Patient accepts or declines
7. If accepted: slot filled, appointment created, remaining invitations stop
8. Audit log updated

## Recall

1. Patient becomes due for hygiene recall
2. Practice-approved reminder sequence begins
3. Initial reminder sent (simulated)
4. Follow-up message after 3 days
5. Alternative channel after 7 days
6. Human call task after 10 days
7. Patient responds → appointment offered → booking recorded
8. Team can intervene at any point

## Treatment follow-up

1. Consultation completed without booking
2. Follow-up sequence begins after 2 days
3. AI answers administrative questions from approved knowledge
4. Clinical questions handed off to human
5. Financing information offered
6. Coordinator call offered if needed
7. Outcome recorded (booked, not ready, declined, closed)

## Emergency escalation

1. Patient describes symptoms
2. AI checks for red flags: severe swelling, breathing difficulty, uncontrolled bleeding, major trauma, loss of consciousness
3. If red flag detected:
   - Stop normal workflow
   - Display urgent escalation language
   - Advise contacting emergency services
   - Notify human in simulation
4. If no red flag: continue with appointment booking
