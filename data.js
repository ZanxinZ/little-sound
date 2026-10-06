const SOUNDS = [
['iː','长元音','sheep','/ʃiːp/','绵羊','嘴角轻轻向两边拉，舌头靠前，声音拉长。','green','tree'],
['ɪ','短元音','fish','/fɪʃ/','鱼','嘴巴放松，舌头靠前，声音短而轻。','sit','milk'],
['e','短元音','bed','/bed/','床','嘴巴微张，舌头靠前，像 bed 中间的声音。','pen','red'],
['æ','短元音','cat','/kæt/','猫','嘴巴张得较大，嘴角向两边，舌头靠前。','bag','apple'],
['ɑː','长元音','car','/kɑː/','汽车','嘴巴张大，舌头放低靠后，声音拉长。','park','star'],
['ɒ','短元音','dog','/dɒɡ/','狗','嘴巴张开，嘴唇微圆，声音短。','hot','box'],
['ɔː','长元音','ball','/bɔːl/','球','嘴唇圆圆的，舌头靠后，声音拉长。','door','four'],
['ʊ','短元音','book','/bʊk/','书','嘴唇轻轻圆起，保持放松，声音短。','good','foot'],
['uː','长元音','moon','/muːn/','月亮','嘴唇收圆，舌头抬高靠后，声音拉长。','blue','food'],
['ʌ','短元音','sun','/sʌn/','太阳','嘴唇放松，嘴巴适度张开，发出短音。','cup','bus'],
['ɜː','长元音','bird','/bɜːd/','鸟','嘴唇放松，舌头居中，声音拉长；英式读法不卷舌。','girl','nurse'],
['ə','短元音','about','/əˈbaʊt/','关于','嘴巴和舌头放松，发很轻的声音，常在非重读音节。','banana','sofa'],
['eɪ','双元音','cake','/keɪk/','蛋糕','从 /e/ 向 /ɪ/ 滑动，前面的声音更清楚。','day','rain'],
['aɪ','双元音','kite','/kaɪt/','风筝','从张口的 /a/ 向 /ɪ/ 滑动，嘴巴慢慢收小。','bike','five'],
['ɔɪ','双元音','toy','/tɔɪ/','玩具','从圆唇的 /ɔ/ 向 /ɪ/ 滑动。','boy','coin'],
['əʊ','双元音','boat','/bəʊt/','小船','从放松的 /ə/ 向 /ʊ/ 滑动，嘴唇逐渐变圆。','nose','home'],
['aʊ','双元音','cow','/kaʊ/','奶牛','先张开嘴，再向 /ʊ/ 滑动，嘴唇逐渐收圆。','house','brown'],
['ɪə','双元音','ear','/ɪə/','耳朵','从 /ɪ/ 向轻轻的 /ə/ 滑动，传统英式读法不卷舌。','near','dear'],
['eə','双元音','chair','/tʃeə/','椅子','从 /e/ 向 /ə/ 滑动，传统英式读法不卷舌。','hair','bear'],
['ʊə','双元音','tourist','/ˈtʊərɪst/','游客','从 /ʊ/ 向 /ə/ 滑动；现代英式英语中这个音也常变为 /ɔː/。','pure','cure'],
['p','清辅音','pen','/pen/','钢笔','双唇闭合后突然打开，气流冲出，声带不振动。','pig','cap'],
['b','浊辅音','bag','/bæɡ/','书包','双唇闭合后打开，同时让声带振动。','boy','bus'],
['t','清辅音','tea','/tiː/','茶','舌尖抵住上齿龈，突然放开，声带不振动。','ten','hat'],
['d','浊辅音','dog','/dɒɡ/','狗','舌尖抵住上齿龈后放开，同时让声带振动。','day','bed'],
['k','清辅音','kite','/kaɪt/','风筝','舌后部抬起挡住气流，再放开，声带不振动。','cat','book'],
['ɡ','浊辅音','go','/ɡəʊ/','去','舌后部抬起再放开，同时让声带振动。','girl','big'],
['f','清辅音','fish','/fɪʃ/','鱼','上齿轻碰下唇，让气流从缝隙吹过。','five','leaf'],
['v','浊辅音','van','/væn/','小货车','上齿轻碰下唇，让气流通过，同时让声带振动。','very','love'],
['θ','清辅音','three','/θriː/','三','舌尖轻放在上下牙齿之间，轻轻吹气，不要咬紧。','think','bath'],
['ð','浊辅音','this','/ðɪs/','这个','舌尖轻放在上下牙齿之间，让气流通过，同时声带振动。','that','mother'],
['s','清辅音','sun','/sʌn/','太阳','舌尖靠近上齿龈，气流从窄缝通过，像轻轻的嘶声。','six','bus'],
['z','浊辅音','zoo','/zuː/','动物园','口型像 /s/，同时让声带振动。','zero','rose'],
['ʃ','清辅音','ship','/ʃɪp/','轮船','嘴唇稍向前，舌头抬起，让气流通过，像轻轻嘘声。','shoe','fish'],
['ʒ','浊辅音','vision','/ˈvɪʒən/','视力','口型像 /ʃ/，同时让声带振动；听 vision 的中间音。','measure','treasure'],
['h','清辅音','hat','/hæt/','帽子','嘴巴放松，轻轻呼气，声带不振动。','hello','home'],
['tʃ','清辅音','chair','/tʃeə/','椅子','先用舌头挡住气流，再放开并接上 /ʃ/，合成一个音。','cheese','watch'],
['dʒ','浊辅音','juice','/dʒuːs/','果汁','先挡住气流，再放开并接上 /ʒ/，声带振动。','jump','orange'],
['m','鼻音','moon','/muːn/','月亮','双唇闭合，声带振动，气流从鼻子出来。','milk','swim'],
['n','鼻音','nose','/nəʊz/','鼻子','舌尖抵住上齿龈，声带振动，气流从鼻子出来。','nine','sun'],
['ŋ','鼻音','sing','/sɪŋ/','唱歌','舌后部抬起，气流从鼻子出来；sing 末尾不要额外加 /ɡ/。','king','ring'],
['l','其他辅音','leaf','/liːf/','叶子','舌尖抵住上齿龈，气流从舌头两边通过。','light','love'],
['r','其他辅音','red','/red/','红色','舌尖抬起但不碰上颚，嘴唇稍圆。音标表常用 /r/ 表示英语的 /ɹ/。','rain','rabbit'],
['j','其他辅音','yes','/jes/','是','舌头抬高靠前，再快速滑向后面的元音。','yellow','you'],
['w','其他辅音','we','/wiː/','我们','先收圆嘴唇，再快速滑向后面的元音。','water','window']
].map((x,i)=>({id:i,symbol:x[0],type:x[1],word:x[2],ipa:x[3],zh:x[4],tip:x[5],extra:x.slice(6)}));
const WORD_PICTURES=['🐑','🐟','🛏️','🐱','🚗','🐶','⚽','📚','🌙','☀️','🐦','💬','🍰','🪁','🧸','⛵','🐮','👂','🪑','🧳','🖊️','🎒','🍵','🐶','🪁','🚶','🐟','🚐','3','👈','☀️','🦁','🚢','👀','🎩','🪑','🧃','🌙','👃','🎤','🍃','🔴','👍','👫'];
const IPA_SYMBOLS = SOUNDS.map(s=>s.symbol).sort((a,b)=>b.length-a.length);
function splitIPA(ipa){
  let remaining=ipa.replace(/[\/ˈˌ.]/g,'');const parts=[];
  while(remaining){const symbol=IPA_SYMBOLS.find(x=>remaining.startsWith(x));if(!symbol)throw new Error('Unknown phoneme: '+remaining);parts.push(SOUNDS.find(s=>s.symbol===symbol).id);remaining=remaining.slice(symbol.length);}
  return parts;
}
SOUNDS.forEach(s=>s.parts=splitIPA(s.ipa));
const GRADES = [
{name:'一年级',theme:'你好，世界！',level:'问候 · 颜色 · 数字',sentences:[['Hello, my name is Lily.','你好，我叫莉莉。','Hello, my ___ is Lily.','name','book','cat'],['Good morning!','早上好！','Good ___!','morning','blue','three'],['This is a red apple.','这是一个红苹果。','This is a ___ apple.','red','hello','two'],['I have two pencils.','我有两支铅笔。','I have ___ pencils.','two','sun','happy'],['It is a blue bag.','这是一个蓝色的书包。','It is a blue ___.','bag','sleep','run'],['Thank you very much.','非常感谢你。','Thank ___ very much.','you','it','is']]},
{name:'二年级',theme:'我的小小世界',level:'家人 · 动物 · 喜好',sentences:[['This is my mother.','这是我的妈妈。','This is my ___.','mother','yellow','seven'],['I like cats and dogs.','我喜欢猫和狗。','I ___ cats and dogs.','like','am','is'],['The rabbit is white.','这只兔子是白色的。','The rabbit ___ white.','is','are','am'],['My sister is six years old.','我妹妹六岁了。','My sister is six years ___.','old','big','blue'],['I can see a bird.','我能看见一只鸟。','I can ___ a bird.','see','is','am'],['Do you like bananas?','你喜欢香蕉吗？','Do ___ like bananas?','you','is','am']]},
{name:'三年级',theme:'校园里的每一天',level:'学校 · 物品 · 能力',sentences:[['I go to school by bus.','我乘公交车去上学。','I go to school ___ bus.','by','in','under'],['Where is my English book?','我的英语书在哪里？','___ is my English book?','Where','Who','How'],['The pencil is on the desk.','铅笔在桌子上。','The pencil is ___ the desk.','on','go','can'],['I can swim, but I cannot fly.','我会游泳，但我不会飞。','I can swim, ___ I cannot fly.','but','or','so'],['We have English on Monday.','我们星期一有英语课。','We have English ___ Monday.','on','at','under'],['Please open your book.','请打开你的书。','Please ___ your book.','open','red','happy']]},
{name:'四年级',theme:'生活的小发现',level:'日常 · 时间 · 天气',sentences:[['I get up at seven every morning.','我每天早上七点起床。','I get up ___ seven every morning.','at','on','under'],['What would you like for lunch?','午餐你想吃什么？','What would you ___ for lunch?','like','likes','liking'],['It is sunny and warm today.','今天晴朗又暖和。','It is sunny and ___ today.','warm','eat','read'],['She is reading a book.','她正在读一本书。','She is ___ a book.','reading','read','reads'],['There are four seasons in a year.','一年有四个季节。','There ___ four seasons in a year.','are','is','am'],['The library is next to the classroom.','图书馆在教室旁边。','The library is next ___ the classroom.','to','at','by']]},
{name:'五年级',theme:'一起探索更多',level:'计划 · 比较 · 习惯',sentences:[['I usually do my homework after school.','我通常放学后做作业。','I usually do my homework ___ school.','after','between','under'],['What are you going to do this weekend?','这个周末你打算做什么？','What are you ___ to do this weekend?','going','go','went'],['My brother is taller than me.','我的哥哥比我高。','My brother is taller ___ me.','than','then','that'],['We should drink water every day.','我们应该每天喝水。','We ___ drink water every day.','should','are','has'],['I want to be a teacher.','我想成为一名老师。','I want ___ be a teacher.','to','at','on'],['How often do you play football?','你多久踢一次足球？','How ___ do you play football?','often','many','old']]},
{name:'六年级',theme:'把故事说给你听',level:'过去 · 未来 · 原因',sentences:[['I visited my grandparents last Sunday.','我上周日去看望了爷爷奶奶。','I ___ my grandparents last Sunday.','visited','visit','visiting'],['We will have a picnic tomorrow.','我们明天将去野餐。','We ___ have a picnic tomorrow.','will','did','were'],['I like English because it is interesting.','我喜欢英语，因为它很有趣。','I like English ___ it is interesting.','because','but','or'],['If it rains, we will stay at home.','如果下雨，我们就待在家里。','If it ___, we will stay at home.','rains','rain','raining'],['She was happy to see her friend.','见到她的朋友，她很开心。','She ___ happy to see her friend.','was','were','are'],['Could you tell me the way to the park?','你能告诉我去公园的路吗？','Could you ___ me the way to the park?','tell','told','telling']]}
];
