
import React, { useEffect } from 'react';
import { Language } from '../types';

interface BlogDetailProps {
  blogId: string;
  lang?: Language;
  onBack: () => void;
}

const BLOG_CONTENT: Record<string, any> = {
  'areca-plates': {
    title: { en: "Leaf Dining: The Bio-Pure Revolution", te: "ఆకు భోజనం: బయో-ప్యూర్ విప్లవం" },
    subtitle: { en: "Why naturally fallen leaves are the future of safe dining.", te: "సహజంగా రాలిపోయిన ఆకులు సురక్షితమైన భోజనానికి ఎందుకు భవిష్యత్తు." },
    hero: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "Zero Toxins, Pure Taste", te: "సున్నా విష పదార్థాలు, స్వచ్ఛమైన రుచి" },
        content: { 
          en: "Areca plates (and traditional Vistarakulu) are unique because they are thermally stable. Unlike plastic that leaches BPA when heated, leaf plates handle hot sambar and curries without releasing a single molecule of harmful chemicals. Your food tastes as it should - natural and clean.",
          te: "అరెకా ప్లేట్లు మరియు విస్తరాకులు ఉష్ణపరంగా స్థిరంగా ఉంటాయి. వేడి చేసినప్పుడు BPA ని విడుదల చేసే ప్లాస్టిక్ లా కాకుండా, ఆకు ప్లేట్లు ఎటువంటి హానికరమైన రసాయనాలను విడుదల చేయకుండా వేడి సాంబార్ మరియు కూరలను తట్టుకోగలవు."
        }
      },
      {
        heading: { en: "Composting: Closing the Loop", te: "కంపోస్టింగ్: లూప్‌ను మూసివేయడం" },
        content: { 
          en: "Every plate you discard returns to the earth in 60 days. It transforms into nutrient-rich compost, making the soil more fertile for the next generation of trees. It is the ultimate circular economy where 'waste' becomes 'life'.",
          te: "మీరు పారవేసే ప్రతి ప్లేట్ 60 రోజుల్లో భూమికి తిరిగి చేరుతుంది. ఇది పోషకాలు అధికంగా ఉండే కంపోస్ట్‌గా మారుతుంది, తదుపరి తరం చెట్ల కోసం నేలను మరింత సారవంతం చేస్తుంది."
        }
      }
    ]
  },
  'leaf-bowls': {
    title: { en: "The Science of Natural Insulation", te: "సహజ అవాహకం వెనుక ఉన్న విజ్ఞానం" },
    subtitle: { en: "How nature keeps your food hot and your hands cool.", te: "ప్రకృతి మీ ఆహారాన్ని వేడిగా మరియు మీ చేతులను చల్లగా ఎలా ఉంచుతుంది." },
    hero: "https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "Thermal Barrier Properties", te: "థర్మల్ బారియర్ లక్షణాలు" },
        content: { 
          en: "Areca leaf doppalu (Prasadam bowls) have a natural air-cell structure within their fibers. This provides excellent thermal insulation. Whether you are serving hot prasadam or chilled desserts, the bowl maintains temperature longer than paper or thin plastic, all while being 100% biodegradable.",
          te: "అరెకా ఆకు డొప్పలు వాటి నారలలో సహజమైన గాలి-కణ నిర్మాణాన్ని కలిగి ఉంటాయి. ఇది అద్భుతమైన థర్మల్ ఇన్సులేషన్‌ను అందిస్తుంది. వేడి ప్రసాదం లేదా చల్లని డెజర్ట్‌లు వడ్డించినా, ఇది ఉష్ణోగ్రతను ఎక్కువ కాలం కాపాడుతుంది."
        }
      }
    ]
  },
  'purity': {
    title: { en: "Earthenware: Healing Through Clay", te: "మట్టి పాత్రలు: మట్టి ద్వారా స్వస్థత" },
    subtitle: { en: "The alkaline secret of traditional water storage.", te: "సాంప్రదాయ నీటి నిల్వ యొక్క ఆల్కలీన్ రహస్యం." },
    hero: "https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "The Alkaline Advantage", te: "ఆల్కలీన్ ప్రయోజనం" },
        content: { 
          en: "Clay is naturally alkaline. When you store water in our clay bottles or drink from our glasses, the clay reacts with the acidity of the water, balancing its pH levels. This helps in soothing acidity and gastric pains, providing a 'living water' experience that plastic bottles can never replicate.",
          te: "మట్టి సహజంగా ఆల్కలీన్ లక్షణాలను కలిగి ఉంటుంది. మీరు మా మట్టి బాటిళ్లలో నీటిని నిల్వ చేసినప్పుడు లేదా గ్లాసుల నుండి తాగినప్పుడు, మట్టి నీటిలోని అసిడిటీతో ప్రతిస్పందించి దాని pH స్థాయిలను సమతుల్యం చేస్తుంది."
        }
      },
      {
        heading: { en: "Natural Cooling via Porosity", te: "రంధ్రాల ద్వారా సహజ శీతలీకరణ" },
        content: { 
          en: "The microscopic pores in unglazed earthenware allow for minute evaporation. This process absorbs heat from the water inside, keeping it naturally cool even in the harshest summers without electricity. It's nature's own refrigerator.",
          te: "మెరుపు లేని మట్టి పాత్రలలోని సూక్ష్మ రంధ్రాలు స్వల్ప బాష్పీభవనాన్ని అనుమతిస్తాయి. ఈ ప్రక్రియ లోపల ఉన్న నీటి నుండి వేడిని గ్రహించి, విద్యుత్తు లేకుండానే వేసవిలో కూడా సహజంగా చల్లగా ఉంచుతుంది."
        }
      }
    ]
  },
  'organic-honey': {
    title: { en: "Forest Gold: The Raw Honey Wisdom", te: "ఫారెస్ట్ గోల్డ్: పచ్చి తేనె యొక్క జ్ఞానం" },
    subtitle: { en: "Why wild-harvested honey is a nutritional powerhouse.", te: "అడవిలో సేకరించిన తేనె ఎందుకు పోషకాల గని." },
    hero: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "The Power of Wild Pollen", te: "వైల్డ్ పోలెన్ యొక్క శక్తి" },
        content: { 
          en: "Deepthi Forest Honey is collected from multi-floral sources in deep forests. Unlike farm-raised honey which comes from a single crop, wild honey contains a spectrum of pollen, enzymes, and antioxidants that provide superior immunity boosting properties.",
          te: "దీప్తి ఫారెస్ట్ హనీ లోతైన అడవులలోని వివిధ రకాల పూల నుండి సేకరించబడుతుంది. ఒకే రకమైన పంట నుండి వచ్చే ఫారమ్ హనీ లా కాకుండా, వైల్డ్ హనీలో వివిధ రకాల పోలెన్, ఎంజైములు మరియు యాంటీఆక్సిడెంట్లు ఉంటాయి."
        }
      }
    ]
  },
  'cold-pressed': {
    title: { en: "Cold Pressed: Preserving Life's Essence", te: "కోల్డ్ ప్రెస్డ్: జీవ సారాన్ని కాపాడటం" },
    subtitle: { en: "Moving away from refined oils to natural extracts.", te: "రిఫైన్డ్ ఆయిల్స్ నుండి సహజ సారం వైపు మళ్లడం." },
    hero: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "Zero Heat, Maximum Nutrition", te: "సున్నా వేడి, గరిష్ట పోషణ" },
        content: { 
          en: "Refined oils are processed at high temperatures with chemical solvents, destroying vitamins and healthy fats. Cold pressing uses mechanical pressure without heat, ensuring that the oil retains its vitamin E, natural aroma, and heart-healthy fatty acids.",
          te: "రిఫైన్డ్ ఆయిల్స్ రసాయన ద్రావకాలతో అధిక ఉష్ణోగ్రతల వద్ద ప్రాసెస్ చేయబడతాయి, ఇది విటమిన్లు మరియు ఆరోగ్యకరమైన కొవ్వులను నాశనం చేస్తుంది. కోల్డ్ ప్రెస్సింగ్ వేడి లేకుండా మెకానికల్ ఒత్తిడిని ఉపయోగిస్తుంది."
        }
      }
    ]
  },
  'pulses': {
    title: { en: "Ancient Grains: The Future of Nutrition", te: "పురాతన ధాన్యాలు: పోషణ యొక్క భవిష్యత్తు" },
    subtitle: { en: "Fibrous millets and chemical-free pulses.", te: "పీచు అధికంగా ఉండే చిరుధాన్యాలు మరియు రసాయన రహిత పప్పులు." },
    hero: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=1200",
    sections: [
      {
        heading: { en: "High Fiber for Modern Health", te: "ఆధునిక ఆరోగ్యం కోసం అధిక పీచు" },
        content: { 
          en: "Our millets and pulses are ancient staples that are naturally gluten-free and rich in dietary fiber. They help in regulating blood sugar and improving digestive health. By choosing organic, you ensure that no pesticide residues enter your family's meals.",
          te: "మా చిరుధాన్యాలు మరియు పప్పులు సహజంగా గ్లూటెన్ రహితమైనవి మరియు పీచు అధికంగా ఉండే పురాతన ఆహారాలు. ఇవి రక్తంలో చక్కెరను నియంత్రించడంలో మరియు జీర్ణక్రియను మెరుగుపరచడంలో సహాయపడతాయి."
        }
      }
    ]
  }
};

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId, lang = 'en', onBack }) => {
  const data = BLOG_CONTENT[blogId] || BLOG_CONTENT['areca-plates'];
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [blogId]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen animate-fade-in relative">
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img 
          src={data.hero} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[10s] ease-linear" 
          alt="Blog Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D5A27] via-black/20 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 lg:p-32 max-w-7xl mx-auto">
           <div className="animate-in slide-in-from-bottom-20 duration-1000">
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-6 block">Deepthi Knowledge Series</span>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white serif mb-6 leading-[1.1]">
               {data.title[lang]}
             </h1>
             <p className="text-white/80 text-lg md:text-xl font-medium max-w-3xl leading-relaxed italic">
               "{data.subtitle[lang]}"
             </p>
           </div>
        </div>

        <button 
          onClick={onBack}
          className="absolute top-10 left-10 bg-white/10 backdrop-blur-xl hover:bg-white text-white hover:text-[#2D5A27] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl z-50 flex items-center gap-3 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Shop
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#A4C639] rounded-full flex items-center justify-center text-white text-3xl shadow-2xl z-20">
          🌿
        </div>

        <div className="space-y-24">
          {data.sections.map((section: any, idx: number) => (
            <article key={idx} className="animate-in slide-in-from-bottom-10 duration-700 delay-300">
              <h2 className="text-3xl md:text-5xl font-bold serif text-[#2D5A27] mb-10 relative">
                <span className="relative z-10">{section.heading[lang]}</span>
                <span className="absolute -bottom-2 left-0 w-24 h-1 bg-[#A4C639] opacity-50"></span>
              </h2>
              <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-[#2D5A27]/5 shadow-sm hover:shadow-xl transition-shadow group">
                <p className="text-lg md:text-xl text-[#4A3728]/80 leading-relaxed font-medium first-letter:text-5xl first-letter:font-bold first-letter:serif first-letter:text-[#A4C639] first-letter:mr-3 first-letter:float-left">
                  {section.content[lang]}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-32 relative group">
          <div className="absolute inset-0 bg-[#2D5A27] organic-shape blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="bg-[#2D5A27] rounded-[4rem] p-12 md:p-24 text-white text-center relative z-10 overflow-hidden shadow-2xl">
            <h3 className="text-4xl md:text-5xl font-bold serif mb-8 leading-tight">
              Switch to Nature Today.
            </h3>
            <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto font-medium">
              Every choice you make at Deepthi Enterprises contributes to a toxin-free body and a plastic-free planet.
            </p>
            <button 
              onClick={onBack}
              className="bg-[#A4C639] text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-[#2D5A27] transition-all transform hover:-translate-y-1 shadow-xl"
            >
              Shop This Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
