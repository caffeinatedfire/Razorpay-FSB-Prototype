import json,urllib.request,urllib.parse,time,sys
def fetch(app,sort,count=199,token=None,hl='en_IN'):
    inner=[None,None,[2,sort,[count,None,token],None,[]],[app,7]]
    freq=json.dumps([[["UsvDTd",json.dumps(inner),None,"generic"]]])
    data=urllib.parse.urlencode({'f.req':freq}).encode()
    req=urllib.request.Request(f'https://play.google.com/_/PlayStoreUi/data/batchexecute?hl={hl}&gl=in',data=data,headers={'User-Agent':'Mozilla/5.0','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'})
    raw=urllib.request.urlopen(req,timeout=40).read().decode('utf8')
    line=[l for l in raw.split('\n') if l.startswith('[["wrb.fr"')][0]
    payload=json.loads(json.loads(line)[0][2])
    revs=payload[0] or []
    tail=payload[-1] if len(payload)>1 else None
    nxt=tail[-1] if isinstance(tail,list) and tail and isinstance(tail[-1],str) else None
    out=[]
    for r in revs:
        out.append({'body':r[4],'rating':r[2],'date':time.strftime('%Y-%m-%d',time.gmtime(r[5][0])) if r[5] else 'unknown','id':r[0]})
    return out,nxt
app,name=sys.argv[1],sys.argv[2]
pages=int(sys.argv[3]) if len(sys.argv)>3 else 3
allr={}
for sort in (1,2):
    tok=None
    for p in range(pages):
        rs,tok=fetch(app,sort,token=tok)
        for r in rs: allr[r['id']]=r
        time.sleep(1.5)
        if not tok: break
json.dump(list(allr.values()),open(f'play/{name}.json','w',encoding='utf8'),ensure_ascii=False,indent=0)
print(name,len(allr))
