# OpenAI Account Upgraden naar Pay-As-You-Go

## Stap-voor-Stap Handleiding

### Stap 1: Ga naar Billing Settings

1. **Log in op OpenAI Platform**
   - Ga naar: https://platform.openai.com
   - Log in met je account

2. **Navigeer naar Billing**
   - Klik op je profiel (rechtsboven)
   - Klik op "Billing" of ga direct naar: https://platform.openai.com/account/billing

### Stap 2: Voeg Betaalmethode Toe

1. **Ga naar "Payment methods"**
   - In het billing menu, klik op "Payment methods"
   - Of ga direct naar: https://platform.openai.com/account/billing/payment-methods

2. **Voeg een betaalmethode toe**
   - Klik op "Add payment method"
   - Kies je betaalmethode:
     - Credit card (Visa, Mastercard, Amex)
     - Debit card
   - Vul je kaartgegevens in
   - Bevestig

### Stap 3: Stel Usage Limits In (Optioneel)

1. **Ga naar "Usage limits"**
   - In billing settings, klik op "Usage limits"
   - Stel je maandelijkse limiet in (of laat onbeperkt)
   - Dit helpt om onverwachte kosten te voorkomen

### Stap 4: Verifieer je Account

Soms vraagt OpenAI om:
- Telefoonnummer verificatie
- Email verificatie
- Identiteitsverificatie (voor hogere limits)

Volg de instructies op het scherm.

## Wat Verandert Er?

### Free Tier (Gratis)
- Zeer lage rate limits
- Beperkte credits
- Niet geschikt voor productie gebruik

### Pay-As-You-Go
- ✅ Hogere rate limits (meer requests per minuut)
- ✅ Betere service kwaliteit
- ✅ Je betaalt alleen voor wat je gebruikt
- ✅ Meestal $5-10 start credit

## Rate Limits per Account Type

### Free Tier
- ~3 requests per minuut voor embeddings
- Zeer beperkt

### Pay-As-You-Go (Tier 1)
- ~60 requests per minuut voor embeddings
- Veel beter voor development

### Pay-As-You-Go (Tier 2+)
- Nog hogere limits
- Afhankelijk van je usage history

## Kosten voor Embeddings

OpenAI embeddings zijn zeer goedkoop:
- **text-embedding-3-small**: $0.02 per 1M tokens
- Voor 12 artikelen: ongeveer $0.0001 (vrijwel gratis)

## Snelle Links

- **Billing Dashboard**: https://platform.openai.com/account/billing
- **Payment Methods**: https://platform.openai.com/account/billing/payment-methods
- **Usage Limits**: https://platform.openai.com/account/billing/limits
- **API Usage**: https://platform.openai.com/usage

## Na het Upgraden

1. **Wacht 1-2 minuten** voor de changes door te voeren
2. **Probeer opnieuw**:
   ```bash
   npm run seed
   ```
3. **Check je usage** op het dashboard om te zien hoeveel je gebruikt

## Troubleshooting

### "Payment method not accepted"
- Probeer een andere kaart
- Check of je kaart internationale betalingen toestaat
- Sommige prepaid cards werken niet

### "Account verification required"
- Volg de verificatie stappen
- Dit is normaal voor nieuwe accounts

### Rate limits blijven laag
- Wacht 5-10 minuten na het toevoegen van betaalmethode
- Check of je account volledig geverifieerd is
- Contact OpenAI support als het probleem blijft

## Alternatief: Wacht Even

Als je niet direct wilt upgraden:
- Wacht 10-15 minuten
- Probeer dan opnieuw `npm run seed`
- Free tier heeft vaak een "cooling off" periode

Maar voor betrouwbaar gebruik is pay-as-you-go sterk aanbevolen!
