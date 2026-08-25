/* Nisulka AI Provider Manager v1. Provider-neutral; secrets stay with the user or server. */
(function(w){'use strict';
  const NS=w.NisulkaTools=w.NisulkaTools||{};
  const providers={
    pollinations:{label:'Pollinations',supports:['image','text'],requiresKey:true},
    huggingface:{label:'Hugging Face',supports:['image','text','audio'],requiresKey:true},
    custom:{label:'Custom endpoint',supports:['image','text','audio'],requiresKey:true}
  };
  NS.ai={
    providers,
    list(task){return Object.entries(providers).filter(([,p])=>!task||p.supports.includes(task)).map(([id,p])=>({id,...p}));},
    key(id){return NS.storage.get('ai-key:'+id,'');},
    setKey(id,key){if(key)NS.storage.set('ai-key:'+id,String(key));else NS.storage.remove('ai-key:'+id);},
    clearKey(id){NS.storage.remove('ai-key:'+id);},
    async request({provider,endpoint,method='POST',headers={},body,timeout=30000}={}){
      if(!endpoint)throw new Error('AI endpoint is required');
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeout));
      try{const response=await fetch(endpoint,{method,headers,body,signal:controller.signal});if(!response.ok)throw new Error('AI provider returned HTTP '+response.status);const type=response.headers.get('content-type')||'';return type.includes('application/json')?await response.json():await response.blob();}
      finally{clearTimeout(timer);}
    },
    saveConfig(config){NS.storage.set('ai-config',config||{});},
    config(){return NS.storage.get('ai-config',{});}
  };
})(window);
