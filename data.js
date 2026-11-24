/* EduTech content
   All text is written as "English|Georgian". app.js picks the right half.
   To add a task, copy one object in TASKS and change it.
   Sections: fields and companies, certificates and follow-up questions, tasks,
   demo student, employer candidates.
   A task can have nums:[[base,spread,step],...]. Each student then gets slightly
   different numbers in the brief: {0}, {1}... are the numbers, {+} is their sum.
*/

/* ---------- Fields, levels, companies ---------- */
const FIELDS=["Web development|ვებ დეველოპმენტი","Design|დიზაინი","Marketing|მარკეტინგი","Data|მონაცემები","Writing|წერა","Customer support|მომხმარებელთა მხარდაჭერა","Finance|ფინანსები","Engineering|ინჟინერია"];
const F=i=>FIELDS[i];
const BEG="Beginner|დამწყები",MID="Intermediate|საშუალო";
const CO={rioni:"Rioni Coffee|რიონი ქოფი",bagrati:"Bagrati Books|ბაგრატი ბუქსი",satsuri:"Satsuri Shoes|სატსური შუზი",lingua:"LinguaLeap|ლინგვალიპი",youth:"Kutaisi Youth Center|ქუთაისის ახალგაზრდული ცენტრი",agro:"Imereti Agro|იმერეთი აგრო"};

/* ---------- Certificates and follow-up questions ---------- */
/* One certificate per field (same order as FIELDS). It is issued after NEED scored shifts in the field with an average of PASS or more. */
const NEED=2,PASS=70;
const CERT=["Web Development Foundations|ვებ დეველოპმენტის საფუძვლები","Design Basics|დიზაინის საფუძვლები","Marketing Starter|მარკეტინგის დასაწყისი","Data Basics|მონაცემების საფუძვლები","Writing Starter|წერის დასაწყისი","Customer Support Ready|მზად მომხმარებელთა მხარდაჭერისთვის","Finance Basics|ფინანსების საფუძვლები","Engineering Starter|ინჟინერიის დასაწყისი"];
/* After submitting, the "manager" asks one of these. The student answers in their own words. */
const FOLLOW=["Which checklist step was the hardest, and what did you try first?|ჩამონათვალის რომელი პუნქტი იყო ყველაზე რთული და პირველად რა სცადე?",
"If you had 30 more minutes, what exactly would you improve?|კიდევ 30 წუთი რომ გქონოდა, კონკრეტულად რას გააუმჯობესებდი?",
"Pick one decision you made and explain why you did not choose the alternative.|აირჩიე ერთი გადაწყვეტილება, რომელიც მიიღე, და ახსენი, რატომ არ აირჩიე სხვა ვარიანტი.",
"Which part of your answer are you least sure about, and how would you check it?|პასუხის რომელ ნაწილში ხარ ყველაზე ნაკლებად დარწმუნებული და როგორ შეამოწმებდი?",
"Explain your result to a customer in two sentences, without technical words.|ორი წინადადებით, ტექნიკური სიტყვების გარეშე აუხსენი შენი შედეგი მომხმარებელს."];

/* ---------- Tasks shown on the task board ---------- */
const TASKS=[
{id:"web-signup",f:F(0),t:"Fix a broken signup form|შეაკეთე გაფუჭებული რეგისტრაციის ფორმა",co:CO.rioni,who:"Nino, Product lead|ნინო, პროდუქტის მენეჯერი",lvl:BEG,min:45,sk:["HTML","Forms|ფორმები","Debugging|შეცდომების გასწორება"],
b:"Our website signup form lets people submit an empty email and the button does nothing on phones. Customers are complaining. Find what is wrong and explain your fix.|ჩვენი საიტის რეგისტრაციის ფორმა ცარიელი ელფოსტით გაგზავნის საშუალებას იძლევა, ტელეფონზე კი ღილაკი საერთოდ არ მუშაობს. მომხმარებლები უკმაყოფილოები არიან. იპოვე პრობლემა და ახსენი, როგორ გაასწორებ.",
st:["List at least 3 problems you would check for|ჩამოწერე მინიმუმ 3 პრობლემა, რომელსაც შეამოწმებდი","Write the corrected HTML for the form|დაწერე ფორმის გასწორებული HTML","Add validation so empty or wrong emails are blocked|დაამატე ვალიდაცია, რომ ცარიელი ან არასწორი ელფოსტა დაიბლოკოს","Explain how you would test it on a phone|ახსენი, როგორ შეამოწმებდი ტელეფონზე"]},
{id:"web-pricing",f:F(0),t:"Build a pricing card|ააწყვე ფასების ბლოკი",co:CO.bagrati,who:"Giorgi, Frontend dev|გიორგი, ფრონტენდ დეველოპერი",lvl:BEG,min:60,sk:["HTML","CSS","Responsive|ადაპტიური"],
b:"We are launching a book subscription with 3 plans. Build the pricing section so it looks good on desktop and stacks on mobile.|ვიწყებთ წიგნების გამოწერას 3 პაკეტით. ააწყვე ფასების სექცია, რომ კომპიუტერზე კარგად გამოიყურებოდეს და ტელეფონზე ერთმანეთის ქვეშ ჩალაგდეს.",
st:["Three plans: Reader 9 GEL, Bookworm 19 GEL, Library 29 GEL|სამი პაკეტი: მკითხველი 9 ლარი, წიგნის ჭია 19 ლარი, ბიბლიოთეკა 29 ლარი","Highlight the middle plan as most popular|შუა პაკეტი გამოყავი, როგორც ყველაზე პოპულარული","Make it stack on screens under 600px|600px-ზე ვიწრო ეკრანზე ერთმანეთის ქვეშ ჩალაგდეს","Share your code or a CodePen link|გააზიარე კოდი ან CodePen-ის ბმული"]},
{id:"web-speed",f:F(0),t:"Make a slow page faster|ნელი გვერდი გახადე სწრაფი",co:CO.satsuri,who:"Giorgi, Frontend dev|გიორგი, ფრონტენდ დეველოპერი",lvl:MID,min:60,sk:["Performance|სისწრაფე","Images|სურათები","Debugging|შეცდომების გასწორება"],
b:"Our shoe catalogue takes 9 seconds to load on mobile data. Find the three biggest problems and fix them.|ჩვენი ფეხსაცმლის კატალოგი მობილურ ინტერნეტზე 9 წამი იტვირთება. იპოვე სამი ყველაზე დიდი პრობლემა და გაასწორე.",
st:["Run a speed test and note the score|გაუშვი სისწრაფის ტესტი და ჩაიწერე ქულა","Find the 3 biggest problems|იპოვე 3 ყველაზე დიდი პრობლემა","Fix images and loading order|გაასწორე სურათები და ჩატვირთვის რიგი","Report the new score|აცნობე ახალი ქულა"]},
{id:"des-menu",f:F(1),t:"Redesign a café menu for phones|გადააკეთე კაფის მენიუ ტელეფონისთვის",co:CO.rioni,who:"Ana, Owner|ანა, მფლობელი",lvl:BEG,min:60,sk:["UI design|UI დიზაინი","Typography|ტიპოგრაფია","Figma"],
b:"Our paper menu was scanned as a photo and it is unreadable on phones. Design a simple mobile menu page for our QR code.|ჩვენი ქაღალდის მენიუ ფოტოდ არის დასკანერებული და ტელეფონზე არ იკითხება. შექმენი მარტივი მობილური მენიუ ჩვენი QR კოდისთვის.",
st:["Group items into coffee, tea, food|დაყავი ყავად, ჩაიდ და საჭმელად","Pick 2 fonts and 3 colours and say why|აირჩიე 2 შრიფტი და 3 ფერი და ახსენი რატომ","Make prices easy to scan|ფასები ადვილად იკითხებოდეს","Share a Figma or image link|გააზიარე Figma-ს ან სურათის ბმული"]},
{id:"des-posts",f:F(1),t:"Three posts for a book fair|სამი პოსტი წიგნის ბაზრობისთვის",co:CO.bagrati,who:"Luka, Marketing|ლუკა, მარკეტინგი",lvl:MID,min:75,sk:["Social media|სოციალური მედია","Branding|ბრენდინგი","Layout|კომპოზიცია"],
b:"Kutaisi Book Fair is in two weeks. We need three Instagram posts: announcement, guest author, last-day reminder.|ქუთაისის წიგნის ბაზრობა ორ კვირაშია. გვჭირდება სამი Instagram პოსტი: ანონსი, სტუმარი ავტორი და ბოლო დღის შეხსენება.",
st:["Keep one visual style across all three|სამივეს ჰქონდეს ერთი ვიზუალური სტილი","Each post has one clear message|თითო პოსტს ჰქონდეს ერთი მკაფიო გზავნილი","Include date and place|მიუთითე თარიღი და ადგილი","Share links to your designs|გააზიარე დიზაინების ბმულები"]},
{id:"mk-email",f:F(2),t:"Write a launch email|დაწერე გაშვების ელწერილი",co:CO.lingua,who:"Tamar, Growth|თამარი, ზრდის მენეჯერი",lvl:BEG,min:40,sk:["Copywriting|კოპირაიტინგი","Email|ელფოსტა","Audience|აუდიტორია"],
b:"Our language app adds a new Georgian to English speaking mode. Write the email that goes to 20,000 users.|ჩვენს ენის აპს ემატება ახალი ქართულიდან ინგლისურზე საუბრის რეჟიმი. დაწერე წერილი, რომელიც 20 000 მომხმარებელს გაეგზავნება.",
st:["Write 3 subject line options|დაწერე სათაურის 3 ვარიანტი","Body under 150 words|ტექსტი 150 სიტყვაზე ნაკლები","One clear button text|ღილაკის ერთი მკაფიო ტექსტი","Say which subject line you would test first|თქვი, რომელ სათაურს გამოსცდიდი პირველს"]},
{id:"mk-tiktok",f:F(2),t:"Plan a week of TikTok videos|დაგეგმე ერთი კვირის TikTok ვიდეოები",co:CO.satsuri,who:"Dato, Brand manager|დათო, ბრენდ-მენეჯერი",lvl:MID,min:60,sk:["Content plan|კონტენტ-გეგმა","Social media|სოციალური მედია","Trends|ტრენდები"],
b:"We sell sneakers to students. Plan 7 TikTok videos for one week that could get us noticed.|სტუდენტებს სპორტულ ფეხსაცმელს ვყიდით. დაგეგმე ერთი კვირისთვის 7 TikTok ვიდეო, რომელიც ყურადღებას მიიქცევს.",
st:["One idea per day with a 2-second hook|დღეში ერთი იდეა, პირველ 2 წამში მიმზიდველი დასაწყისით","Mix fun, product and behind-the-scenes|შეურიე გასართობი, პროდუქტი და კულისები","Say what you would measure|თქვი, რას გაზომავდი","Pick your best idea and explain why|აირჩიე საუკეთესო იდეა და ახსენი რატომ"]},
{id:"dt-sales",f:F(3),t:"Find the top 3 products|იპოვე 3 საუკეთესო პროდუქტი",co:CO.satsuri,who:"Irakli, Analyst|ირაკლი, ანალიტიკოსი",lvl:MID,min:60,sk:["Spreadsheets|ცხრილები","Analysis|ანალიზი","Charts|დიაგრამები"],
nums:[[120,4,5],[300,6,5],[45,3,5],[410,6,5]],
b:"Sales last month: Runner {0} pairs at 150 GEL, Classic {1} at 90 GEL, Hiker {2} at 220 GEL, Slide {3} at 35 GEL. Which products matter most and why?|გასული თვის გაყიდვები: Runner {0} წყვილი 150 ლარად, Classic {1} წყვილი 90 ლარად, Hiker {2} წყვილი 220 ლარად, Slide {3} წყვილი 35 ლარად. რომელი პროდუქტია ყველაზე მნიშვნელოვანი და რატომ?",
st:["Calculate revenue for each product|გამოთვალე თითოეული პროდუქტის შემოსავალი","Rank by revenue and by units|დაალაგე შემოსავლით და რაოდენობით","Suggest one chart for the manager|შესთავაზე ერთი დიაგრამა მენეჯერისთვის","Give one recommendation in plain words|მარტივი სიტყვებით მიეცი ერთი რეკომენდაცია"]},
{id:"dt-survey",f:F(3),t:"What do students want?|რა უნდათ მოსწავლეებს?",co:CO.youth,who:"Mariam, Coordinator|მარიამი, კოორდინატორი",lvl:BEG,min:45,sk:["Surveys|გამოკითხვები","Insights|დასკვნები","Reporting|ანგარიშგება"],
nums:[[82,6,1],[46,5,1],[30,5,1],[42,5,1]],
b:"We asked {+} students which club to open: robotics {0}, film {1}, chess {2}, music {3}. Write a short summary for our director.|{+} მოსწავლეს ვკითხეთ, რომელი კლუბი გავხსნათ: რობოტიკა {0}, კინო {1}, ჭადრაკი {2}, მუსიკა {3}. დაწერე მოკლე შეჯამება დირექტორისთვის.",
st:["Turn the numbers into percentages|რიცხვები გადაიყვანე პროცენტებში","State the main finding in one sentence|მთავარი დასკვნა ერთ წინადადებაში","Note one limit of this survey|აღნიშნე ამ გამოკითხვის ერთი ნაკლი","Suggest a next step|შესთავაზე შემდეგი ნაბიჯი"]},
{id:"wr-boots",f:F(4),t:"Product text for hiking boots|ტექსტი სალაშქრო ფეხსაცმლისთვის",co:CO.satsuri,who:"Nia, Content lead|ნია, კონტენტის ხელმძღვანელი",lvl:BEG,min:30,sk:["Copywriting|კოპირაიტინგი","SEO","Tone|ტონი"],
b:"New waterproof boots for Svaneti hikes. Write the product page text.|ახალი წყალგაუმტარი ფეხსაცმელი სვანეთში სალაშქროდ. დაწერე პროდუქტის გვერდის ტექსტი.",
st:["A title under 60 characters|სათაური 60 სიმბოლოზე ნაკლები","A 2-sentence intro that sells the benefit|2-წინადადებიანი შესავალი, რომელიც სარგებელს ყიდის","5 bullet features|5 მახასიათებელი სიის სახით","Friendly, outdoorsy tone|მეგობრული, ბუნების მოყვარულის ტონი"]},
{id:"cs-late",f:F(5),t:"Reply to an angry customer|უპასუხე გაბრაზებულ მომხმარებელს",co:CO.bagrati,who:"Eka, Support lead|ეკა, მხარდაჭერის ხელმძღვანელი",lvl:BEG,min:25,sk:["Empathy|თანაგრძნობა","Writing|წერა","Problem solving|პრობლემის გადაჭრა"],
b:"\"I ordered a birthday gift 10 days ago and it still has not arrived. The birthday was yesterday.\" Write our reply.|„დაბადების დღის საჩუქარი 10 დღის წინ შევუკვეთე და ჯერ კიდევ არ მოსულა. დაბადების დღე გუშინ იყო.“ დაწერე ჩვენი პასუხი.",
st:["Apologise without making excuses|მოიხადე ბოდიში თავის მართლების გარეშე","Offer a concrete fix|შესთავაზე კონკრეტული გამოსავალი","Keep it under 120 words|120 სიტყვაზე ნაკლები","Explain what you would log internally|ახსენი, რას ჩაინიშნავდი შიდა სისტემაში"]},
{id:"cs-faq",f:F(5),t:"Write a delivery FAQ|დაწერე მიწოდების ხშირი კითხვები",co:CO.rioni,who:"Eka, Support lead|ეკა, მხარდაჭერის ხელმძღვანელი",lvl:BEG,min:35,sk:["Writing|წერა","Empathy|თანაგრძნობა","Structure|სტრუქტურა"],
b:"We get the same 20 questions every day about delivery. Turn them into a short FAQ page.|მიწოდებაზე ყოველდღე ერთსა და იმავე 20 კითხვას გვისვამენ. გადააქციე ისინი მოკლე FAQ გვერდად.",
st:["Group questions into 3 topics|დაყავი კითხვები 3 თემად","Answer each in 1-2 sentences|თითოეულს უპასუხე 1-2 წინადადებით","Add a contact option at the end|ბოლოში დაამატე კონტაქტი","Keep a warm tone|შეინარჩუნე თბილი ტონი"]},
{id:"fn-budget",f:F(6),t:"Monthly budget for a small shop|თვიური ბიუჯეტი პატარა მაღაზიისთვის",co:CO.rioni,who:"Ana, Owner|ანა, მფლობელი",lvl:MID,min:60,sk:["Budgeting|ბიუჯეტირება","Spreadsheets|ცხრილები","Planning|დაგეგმვა"],
nums:[[1800,2,100],[900,2,50],[3000,3,100]],
b:"Rent {0} GEL, two staff at 1,200 GEL each, coffee beans {1} GEL, utilities 400 GEL. We sell about {2} cups at 6 GEL. Are we making money?|ქირა {0} ლარი, ორი თანამშრომელი 1 200 ლარად თითო, ყავის მარცვალი {1} ლარი, კომუნალურები 400 ლარი. ვყიდით დაახლოებით {2} ჭიქას 6 ლარად. მოგებაში ვართ?",
st:["Total monthly costs|თვიური ხარჯების ჯამი","Total monthly revenue|თვიური შემოსავლის ჯამი","Profit and margin|მოგება და მარჟა","One idea to improve profit by 10%|ერთი იდეა, რომ მოგება 10%-ით გაიზარდოს"]},
{id:"en-alarm",f:F(7),t:"Spec a greenhouse temperature alarm|დააპროექტე სათბურის ტემპერატურის სიგნალიზაცია",co:CO.agro,who:"Levan, Engineer|ლევანი, ინჟინერი",lvl:MID,min:75,sk:["Arduino","Sensors|სენსორები","Documentation|დოკუმენტაცია"],
b:"Our greenhouse plants die if it gets above 35°C. Design a simple alarm with an Arduino and write the spec.|სათბურში მცენარეები იღუპება, თუ ტემპერატურა 35°C-ს გადააჭარბებს. Arduino-ზე ააწყვე მარტივი სიგნალიზაცია და დაწერე სპეციფიკაცია.",
st:["Pick a sensor and say why|აირჩიე სენსორი და ახსენი რატომ","Describe the wiring|აღწერე შეერთების სქემა","Write the logic in Arduino code|დაწერე ლოგიკა Arduino-ს კოდით","List the rough cost in GEL|მიუთითე სავარაუდო ღირებულება ლარში"]}];


/* ---------- Demo student ("Try the demo account") ---------- */
/* done: s = score, d = date, m = minutes taken, ex = the answer, fb = reviewer feedback */
const ME={n:"Luka Beridze|ლუკა ბერიძე",sh:"Luka B.|ლუკა ბ.",init:"L|ლ",grade:11,city:"Kutaisi|ქუთაისი",f:F(0),joined:"Sep 2026|სექ. 2026",
bio:"I like building websites that small businesses actually use. Looking for a part-time or summer internship in frontend development.|მომწონს ისეთი ვებსაიტების შექმნა, რომლებსაც მცირე ბიზნესები რეალურად იყენებენ. ვეძებ ნახევარ განაკვეთზე ან საზაფხულო სტაჟირებას ფრონტენდ დეველოპმენტში.",
links:["github.com/luka-b","codepen.io/lukab"],
done:{
"web-signup":{s:94,d:"12 Sep|12 სექ",m:38,ex:"Found 4 issues: the button had type=\"button\", no required attributes, a click handler only bound on desktop, and the email field was type=\"text\". Rewrote the form with native validation and tested on Android and iPhone.|ვიპოვე 4 პრობლემა: ღილაკს ჰქონდა type=\"button\", არ იყო required ატრიბუტები, დაჭერის ფუნქცია მხოლოდ კომპიუტერზე მუშაობდა და ელფოსტის ველი იყო type=\"text\". ფორმა თავიდან დავწერე ჩაშენებული ვალიდაციით და შევამოწმე Android-ზე და iPhone-ზე.",fb:"Exactly what I would want from a junior dev. Clear, tested, and you explained why.|ზუსტად ის, რასაც დამწყები დეველოპერისგან ველოდებოდი. მკაფიოა, შემოწმებულია და ახსენი რატომ."},
"web-pricing":{s:89,d:"20 Sep|20 სექ",m:55,ex:"Built three cards with CSS grid, the middle one raised with a \"Most popular\" label. Stacks below 600px. CodePen linked.|სამი ბარათი ავაწყვე CSS grid-ით, შუა ბარათი გამოვყავი წარწერით „ყველაზე პოპულარული“. 600px-ზე ვიწრო ეკრანზე ერთმანეთის ქვეშ ლაგდება. CodePen-ის ბმული მივუთითე.",fb:"Clean code. Next time check colour contrast on the label.|სუფთა კოდია. შემდეგ ჯერზე წარწერის ფერის კონტრასტი შეამოწმე."},
"web-speed":{s:86,d:"9 Oct|9 ოქტ",m:64,ex:"Score went from 41 to 88. Compressed hero images to WebP, added lazy loading, moved the chat widget script to load after the page.|ქულა 41-დან 88-მდე გაიზარდა. მთავარი სურათები WebP-ში შევკუმშე, დავამატე lazy loading და ჩატის სკრიპტი გვერდის შემდეგ ჩავტვირთე.",fb:"Great before and after numbers. That is how you report to a manager.|შესანიშნავი „მანამდე და მერე“ რიცხვები. მენეჯერს სწორედ ასე უნდა მოახსენო."},
"cs-late":{s:91,d:"28 Sep|28 სექ",m:20,ex:"Apologised once, offered a full refund plus free express delivery, and promised a personal follow-up tomorrow. 104 words.|ერთხელ მოვიხადე ბოდიში, შევთავაზე თანხის სრული დაბრუნება და უფასო სწრაფი მიწოდება, და დავპირდი, რომ ხვალ პირადად დავუკავშირდებოდი. 104 სიტყვა.",fb:"Warm and specific. I would send this as is.|თბილი და კონკრეტული. ასევე გავაგზავნიდი."},
"cs-faq":{s:84,d:"3 Oct|3 ოქტ",m:33,ex:"Grouped 20 questions into Ordering, Delivery times, Problems. Added a 'still stuck?' contact block.|20 კითხვა დავყავი სამ თემად: შეკვეთა, მიწოდების დრო, პრობლემები. დავამატე ბლოკი „კიდევ გაქვს კითხვა?“.",fb:"Good structure. Some answers can be shorter.|კარგი სტრუქტურაა. ზოგი პასუხი შეიძლება უფრო მოკლე იყოს."},
"dt-survey":{s:88,d:"15 Oct|15 ოქტ",m:41,ex:"Robotics leads with 41%, almost double film (23%). Limit: students self-selected into the survey. Next step: a robotics taster day.|რობოტიკა ლიდერობს 41%-ით, თითქმის ორჯერ მეტით, ვიდრე კინო (23%). ნაკლი: გამოკითხვაში მონაწილეობა ნებაყოფლობითი იყო. შემდეგი ნაბიჯი: რობოტიკის საცდელი დღე.",fb:"You found the limit most people miss. Nice.|იპოვე ის ნაკლი, რომელიც უმეტესობას გამორჩება. კარგია."},
"dt-sales":{s:79,d:"29 Oct|29 ოქტ",m:68,ex:"Revenue: Classic 27,000, Runner 18,000, Slide 14,350, Hiker 9,900 GEL. Slide sells the most pairs but earns less. Suggested a bar chart by revenue.|შემოსავალი: Classic 27 000, Runner 18 000, Slide 14 350, Hiker 9 900 ლარი. Slide ყველაზე მეტ წყვილს ყიდის, მაგრამ ნაკლებს შოულობს. შევთავაზე სვეტოვანი დიაგრამა შემოსავლის მიხედვით.",fb:"Correct numbers. Recommendation could be more concrete.|რიცხვები სწორია. რეკომენდაცია უფრო კონკრეტული შეიძლება იყოს."},
"mk-email":{s:82,d:"6 Nov|6 ნოე",m:37,ex:"Subject lines: 'Speak English with us today', 'Your new speaking coach is here', 'Talk, don't just type'. Would test the second first.|სათაურები: „ილაპარაკე ინგლისურად დღესვე“, „შენი ახალი სასაუბრო მწვრთნელი აქ არის“, „ილაპარაკე და არა მხოლოდ წერე“. პირველს მეორეს გამოვცდიდი.",fb:"Good options. Body was 160 words, slightly over.|კარგი ვარიანტებია. ტექსტი 160 სიტყვა იყო, ცოტა მეტი."},
"en-alarm":{s:93,d:"14 Nov|14 ნოე",m:72,ex:"DHT22 sensor on an Arduino Nano, buzzer and LED on pins 8 and 9, alarm above 35°C with a 1°C buffer so it does not flicker. About 38 GEL total.|DHT22 სენსორი Arduino Nano-ზე, ზუმერი და LED მე-8 და მე-9 პინებზე, სიგნალი 35°C-ზე ზემოთ 1°C-იანი ბუფერით, რომ არ ციმციმებდეს. ჯამში დაახლოებით 38 ლარი.",fb:"The buffer idea shows real engineering thinking.|ბუფერის იდეა ნამდვილ საინჟინრო აზროვნებას აჩვენებს."}},
invite:CO.satsuri};

/* ---------- Candidates on the employer page ---------- */
const CANDS=[
{n:ME.n,f:F(0),done:9,avg:87,sk:["HTML","CSS","Debugging|შეცდომების გასწორება"],bio:"Builds sites for local shops. 3 certificates.|ადგილობრივი მაღაზიებისთვის ქმნის საიტებს. 3 სერტიფიკატი.",me:1},
{n:"Elene K.|ელენე კ.",f:F(1),done:7,avg:88,sk:["UI design|UI დიზაინი","Figma","Branding|ბრენდინგი"],bio:"Loves clean mobile UI.|უყვარს სუფთა მობილური ინტერფეისი."},
{n:"Nutsa G.|ნუცა გ.",f:F(2),done:5,avg:91,sk:["Copywriting|კოპირაიტინგი","Social media|სოციალური მედია"],bio:"Runs her school's Instagram.|სკოლის Instagram-ს მართავს."},
{n:"Tornike B.|თორნიკე ბ.",f:F(3),done:6,avg:79,sk:["Spreadsheets|ცხრილები","Analysis|ანალიზი"],bio:"Physics-maths student, likes numbers.|ფიზიკა-მათემატიკის მოსწავლე, უყვარს რიცხვები."},
{n:"Mariam D.|მარიამ დ.",f:F(5),done:4,avg:86,sk:["Empathy|თანაგრძნობა","Writing|წერა"],bio:"Volunteer at the youth center.|ახალგაზრდული ცენტრის მოხალისე."},
{n:"Saba T.|საბა ტ.",f:F(7),done:8,avg:90,sk:["Arduino","Sensors|სენსორები"],bio:"Robotics team member.|რობოტიკის გუნდის წევრი."}];

