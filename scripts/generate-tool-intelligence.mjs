import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const tools=JSON.parse(fs.readFileSync(path.join(root,'data/tools.json'),'utf8'));
const seo=fs.existsSync(path.join(root,'data/tool-seo.json'))?JSON.parse(fs.readFileSync(path.join(root,'data/tool-seo.json'),'utf8')):{defaults:{},overrides:{}};
const faq=fs.existsSync(path.join(root,'data/tool-faq.json'))?JSON.parse(fs.readFileSync(path.join(root,'data/tool-faq.json'),'utf8')):{defaults:[],overrides:{}};
const errors=[];const slugs=new Set();
for(const t of tools){if(!t.slug||!t.url||!t.name)errors.push(`${t.path||t.slug}: missing name, slug or url`);if(slugs.has(t.slug))errors.push(`${t.slug}: duplicate slug`);slugs.add(t.slug);if(!t.categorySlug)errors.push(`${t.slug}: missing categorySlug`);if(t.logo&&!t.logo.startsWith('/'))errors.push(`${t.slug}: logo must be site-relative`)}
const report={generatedAt:new Date().toISOString(),toolCount:tools.length,activeTools:tools.filter(t=>t.status==='active').length,categories:[...new Set(tools.map(t=>t.categorySlug).filter(Boolean))].sort(),missingKeywords:tools.filter(t=>!Array.isArray(t.keywords)||!t.keywords.length).map(t=>t.slug),missingSeo:tools.filter(t=>!seo.overrides?.[t.slug]).map(t=>t.slug),missingFaq:tools.filter(t=>!(faq.overrides?.[t.slug]?.length||faq.defaults?.length)).map(t=>t.slug),errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/tool-intelligence.json'),JSON.stringify(report,null,2)+'\n');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Validated ${tools.length} tools across ${report.categories.length} categories.`);
