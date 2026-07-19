---
title: 'Vidura හදපු කතාව: YouTube මගේ server එකට කතා කරන්න බෑ කිව්වා'
description: 'YouTube වීඩියෝවලට සිංහල උපසිරැසි දාන app එකක් හදද්දී මුණගැහුණු ප්‍රශ්න: block වුණු IP, residential proxy එකක්, එක විශාල LLM call එකක්, සහ UI එක අවංක වීමේ වටිනාකම.'
date: 2026-07-19
tags: ['case-study', 'vidura', 'llm']
lang: 'si'
translationOf: 'building-vidura'
---

මම බලපු හොඳම ගණිත දේශනය තිබුණේ YouTube එකේ, විනාඩි 40ක ඉංග්‍රීසි
වීඩියෝවක. මට වඩා දක්ෂ මගේ ඥාති සහෝදරයාට ඒක ඉවර කරන්න බැරි වුණා.
ගණිතය නිසා නෙවෙයි. ඉංග්‍රීසිය නිසා. එක වාක්‍යයක් තේරුම් ගන්න එයා
එකම තත්පර 30 තුන් සැරයක් rewind කරනවා බලං ඉද්දී මට දෙයක් වැටහුණා:
අධ්‍යාපනික YouTube වල භාෂා බාධකය දැනුමේ ප්‍රශ්නයක් නෙවෙයි, ඔරොත්තු
දීමේ ප්‍රශ්නයක්. එක වීඩියෝවකට නම් කොහොමහරි ඔරොත්තු දෙයි. සම්පූර්ණ
course එකකට කවුරුවත් ඔරොත්තු දෙන්නේ නෑ.

YouTube ගේ උත්තරය auto-translate කරපු උපසිරැසි. සිංහලට ඒවා ඇත්තටම
නරකයි. වචනයෙන් වචනය පරිවර්තනය, කොහෙන්වත් ආපු ව්‍යාකරණ, තාක්ෂණික
වචන අමුතුම කවි බවට පත් වෙනවා. ඒ නිසා මම
[Vidura](https://vidura.prabhavalabs.com) හැදුවා: YouTube link එකක්
paste කළාම, මිනිහෙක් කියන විදිහට ලියැවුණු, වීඩියෝවට සමමුහූර්ත වුණු
සිංහල උපසිරැසි සමඟ වීඩියෝව ලැබෙන PWA එකක්. ඒ එක්කම transcript එක
ඇත්තටම කියවපු AI chat සහායකයෙකුත් ඉන්නවා.

<img src="/images/blog/vidura/watch.png" alt="Vidura හි watch පිටුව: සිංහල උපසිරැසි සමඟ YouTube වීඩියෝවක්" />

මේ ලිපිය ඒ ව්‍යාපෘතිය මරන්න ආසන්න වුණු ප්‍රශ්න දෙක ගැනයි, ඒවා
විසඳපු ටිකක් අවලස්සන engineering ගැනයි.

## පළමු ප්‍රශ්නය: YouTube servers එක්ක කතා කරන්නේ නෑ

මගේ පළමු version එක ලැජ්ජා හිතෙන තරම් සරලයි. Server එක video ID එක
අරගෙන caption track එක ගන්නවා, පරිවර්තනය කරනවා, ඉවරයි. මගේ laptop
එකේ පළමු try එකෙන්ම වැඩ කළා. VPS එකට deploy කරලා link එකක් paste
කළාම මොකුත්ම ආවේ නෑ. ආයෙ try කළාම error codes එක්ක මොකුත් ආවේ නෑ.

ඇතුළට වැටෙනකම් කවුරුත් කියලා දෙන්නේ නැති දේ මේකයි: datacenter IP
පරාසවලින් එන requests YouTube සලකන්නේ bots විදිහට, මොකද ගොඩක් වෙලාවට
ඒවා ඇත්තටම bots. මගේ ලාබ VPS එක තියෙන්නේ හරියටම එහෙම පරාසයක. ගෙදර
connection එකෙන් සුමටව ගිය request එකම server එකෙන් යද්දී bot check
එකක වැදුණා.

<img src="/images/blog/vidura/diagram-transcript.svg" alt="රූප සටහන: VPS එකෙන් කෙළින්ම යන requests block වෙනවා; residential proxy හරහා yt-dlp caption track එකට ළඟා වෙනවා; Gemini audio ASR fallback එක" />

මම මුලින්ම ආචාරශීලී විකල්ප try කළා. User agents මාරු කිරීම, backoff,
cookies. එකකින්වත් වැඩක් වුණේ නෑ, ඒක සාධාරණයි කියලත් කියන්න ඕන:
YouTube පැත්තෙන් බලද්දී මගේ server එක scraper farm එකකට සමානයි.
අන්තිමට හරි ගිය විසඳුම නීරසයි, සල්ලිත් යනවා: yt-dlp ගෙවන residential
proxy එකක් හරහා යැවීම. දැන් request එක පිටවෙන්නේ සාමාන්‍ය ගෙදරක ISP
එකකට අයිති IP එකකින්. YouTube මොකුත් වුණේ නැති ගානට caption track
එක දෙනවා.

Audio එක transcribe කරනවා වෙනුවට official captions වලට මෙච්චර මහන්සි
වෙන්නේ ඇයි? Timestamps නිසා. YouTube ගේම caption track එක frame
එකටම නිවැරදියි. Proxy නැති වෙලාවට හෝ captions නැති වීඩියෝවලට Vidura
audio transcription එකට fallback වෙනවා, ඒත් ඒක වැටෙන්නේ තත්පර තුනක
විතර පරාසයකට. තත්පර තුන කියන්නේ උපසිරැසි සහ ටිකක් හොල්මන් වදින
karaoke යන්ත්‍රයක් අතර වෙනස.

ඒ fallback එකෙන් මම පුදුම විදිහට ආඩම්බර වෙන design තීරණයක් බිහි
වුණා: Vidura හි හැම වීඩියෝවක්ම provenance badge එකක් පළඳිනවා.
Timestamps ආවේ YouTube captions වලින්ද audio transcription එකෙන්ද
කියලා ඒක කියනවා, ගණනය කරපු sync score එකක් පෙන්නනවා, පරිවර්තනය කළ
model එකේ නමත් කියනවා. Data එක දෙවැනි පෙළේ නම් UI එක ඒක පිළිගන්නවා.
තව apps වලටත් දේවල් පිළිගන්න පුළුවන් නම් හොඳයි.

## දෙවැනි ප්‍රශ්නය: robot කෙනෙක් වගේ නැති පරිවර්තනයක්

Caption track එකක් පරිවර්තනය කරන්න පේන සරලම විදිහ line by line.
Cues හරහා loop කරලා එකින් එක model එකට යවලා උත්තර ලියාගන්නවා. මම
මුලින්ම හැදුවේ ඒක, ලැබුණේ රසවත් කුණු. එක එක line එක තනියම බැලුවම
හරි. එකට කියවද්දී "function" කියන වචනය එක දේශනයක් ඇතුළේ සිංහල වචන
තුනක් වුණා, වාක්‍ය cue සීමාවලදී කැඩුණා, කවදාවත් හඳුන්වලා නොදුන්
මිනිස්සුන්ට pronouns යොමු වුණා.

ප්‍රශ්නය context එක. Caption cue එකක් වාක්‍යයක් නෙවෙයි, කථිකයා
හුස්ම ගත්ත තැන විතරයි. Cues වෙන වෙනම පරිවර්තනය කිරීම කියන්නේ මතක
නැතිකමින් පරිවර්තනය කිරීම.

<img src="/images/blog/vidura/diagram-translate.svg" alt="රූප සටහන: caption lines වෙන වෙනම පරිවර්තනය කළාම terms මාරු වෙනවා; Vidura සම්පූර්ණ transcript එක එක structured-output call එකකින් යවනවා" />

ඒ නිසා Vidura කරන්නේ අනිත් පැත්ත: සම්පූර්ණ transcript එකම, grounding
එකට වීඩියෝ title සහ description එකත් එක්ක, එක structured-output call
එකකින් යැවීම. එක line එකක්වත් පරිවර්තනය කරන්න කලින් model එක මුළු
දේශනයම දකිනවා. මිනිස් පරිවර්තකයෙක් වැඩ කරන්නෙත් එහෙමයි. විනාඩි 2 සිට
විනාඩි 40 දක්වා terminology එක එකම විදිහට තියෙනවා, model එක අදහස
ඇත්තටම ඉවර වෙන තැන දන්න නිසා වාක්‍ය cue සීමා හරහා ගලාගෙන යනවා.

මේක ආරක්ෂිත කරන guardrails දෙකක් තියෙනවා. Core prompt එක immutable,
ඒ නිසා user කෙනෙක්ගේ custom tone settings වලින් output format එක
කැඩෙන්නේ නෑ. Alignment gate එකක් ප්‍රතිඵලය source cues එක්ක ගළපලා
බලනවා; timestamps වලින් ඈත් වුණු පරිවර්තනයක් කාටවත් පේන්න කලින්
අහුවෙනවා.

[OpenRouter](https://openrouter.ai) වටින තැනත් මේකයි. සම්පූර්ණ
transcript calls ලොකුයි, විනාඩි 40ක දේශනයක් කියන්නේ tokens ගොඩක්.
OpenRouter හරහා මට එකම code එක, පරිවර්තනයක මිල බින්දුවට වට වෙන්න ඕන
වෙලාවට DeepSeek වෙතටත්, වීඩියෝවකට වටින සැලකිල්ල ඕන වෙලාවට GPT
වෙතටත් යොමු කරන්න පුළුවන්, integration එකට අත නොතියා. Model මාරු
කිරීම deploy එකක් නෙවෙයි, settings වෙනසක් විතරයි. තමන්ගේම
infrastructure වලට තමන්ම ගෙවන එක්කෙනෙක්ට ඒ නිදහස තමයි දිගටම දුවන
experiment එකක් සහ නිශ්ශබ්දව නවත්තපු එකක් අතර වෙනස.

<img src="/images/blog/vidura/library.png" alt="Vidura library පිටුව: process කරපු වීඩියෝ සහ ඒවායේ sync scores" />

## නොමිලේ ලැබුණු කොටස්

Transcript pipeline එක අවංක වුණාට පස්සේ, පරිවර්තනය කියවන්න පුළුවන්
වුණාට පස්සේ, app එකේ ඉතුරු ටික එකම data එකෙන්ම ගොඩනැගුණා. Chat
සහායකයා ඔයා බලපු හැම දේකම transcripts වල ground වෙලා, ඒ නිසා උත්තර
නිශ්චිත වීඩියෝවයි timestamp එකයි cite කරනවා. Notes ගත්ත මොහොතටම
pin වෙනවා. උපසිරැසි rendering එකට සම්පූර්ණ VLC සැලකිල්ල ලැබුණා:
size, පාට, background, position, fullscreen එකේදීත් ඒ ඔක්කොම වැඩ.

<img src="/images/blog/vidura/chat.png" alt="Vidura chat සහායකයා library එකට citations එක්ක උත්තර දෙනවා" />

ඔක්කොම self-hosted. ඔයාගේ library එක, notes, chat history ඔයාගේම
server එකේ. මට නම් ඒ කියන්නේ YouTube කෙළින්ම කතා කරන්න කැමති නැති
ඒ ලාබ VPS එකමයි. ඒකේ ලස්සන සමමිතියක් තියෙනවා.

## ආපහු ගියොත් මටම කියන දේවල්

පළමු දවසේම proxy එක ගන්න. ආචාරශීලී workarounds වලට මම ගත කළ රෑවල්
proxy එකේ අවුරුද්දක ගාණට වඩා වටිනවා.

Model එකට ඔක්කොම යවන්න. LLM calls පොඩියට, ලාබෙට තියාගන්න ඕන කියන
මගේ instinct එකෙන් ලැබුණේ වැඩි මුළු වියදමකට නරක පරිවර්තන.

UI එකට අවිනිශ්චිතකම පිළිගන්න ඉඩ දෙන්න. Provenance badges පටන්
ගත්තේ debugging අවශ්‍යතාවයක් විදිහට, දැන් ඒක users වැඩිපුරම කතා
කරන feature එක. මිනිස්සුන්ට perfect data ඕන නෑ, විශ්වාස කරන්න
පුළුවන් data එක මොකක්ද කියලා දැනගන්න ඕන.

Vidura open source, [Prabhava Labs](https://github.com/prabhavalabs/vidura)
organization එක යටතේ. ඉංග්‍රීසි YouTube වලින් හුදු මුරණ්ඩුකමින්
ඉගෙන ගන්න කෙනෙක්ව දන්නවා නම්, link එක එයාට යවන්න.
