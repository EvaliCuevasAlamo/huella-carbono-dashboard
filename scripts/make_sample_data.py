# Genera public/data/co2.csv con DATOS DE EJEMPLO (interpolación lineal 2010-2023).
# Reemplazar por la base de la Fase 1 manteniendo las mismas columnas.
import csv
# país, iso, continente, co2_2010, co2_2023 (Mt), pob_2010, pob_2023 (millones), pib_2010, pib_2023 (miles de millones USD), carbón, petróleo, gas, cemento, quema
D=[("China","CHN","Asia",8000,12000,1338,1410,6000,17800,.70,.15,.06,.08,.01),
("EE. UU.","USA","América del Norte",5400,4900,309,335,15000,27400,.22,.43,.33,.01,.01),
("India","IND","Asia",1600,2900,1234,1428,1700,3550,.66,.22,.07,.05,0),
("Rusia","RUS","Europa",1600,1800,143,144,1500,2000,.22,.25,.50,.03,0),
("Japón","JPN","Asia",1180,1000,128,124,5700,4200,.42,.40,.17,.01,0),
("Alemania","DEU","Europa",800,600,81.7,83.3,3400,4500,.36,.37,.24,.02,.01),
("Reino Unido","GBR","Europa",520,320,62.8,67.7,2500,3350,.22,.40,.36,.01,.01),
("Francia","FRA","Europa",350,300,63,68,2640,3030,.15,.48,.30,.05,.02),
("Brasil","BRA","América del Sur",400,480,196,216,2200,2170,.10,.65,.13,.10,.02),
("México","MEX","América del Norte",450,470,114,129,1050,1790,.10,.56,.27,.06,.01),
("Canadá","CAN","América del Norte",540,570,34,40,1600,2140,.09,.40,.45,.02,.04),
("Australia","AUS","Oceanía",390,380,22,26.5,1150,1720,.45,.35,.18,.01,.01),
("Catar","QAT","Asia",70,100,1.8,2.7,125,220,0,.10,.88,.01,.01),
("Arabia Saudita","SAU","Asia",460,680,27.6,36.9,750,1070,0,.58,.40,.01,.01),
("Nigeria","NGA","África",90,130,159,223,360,363,0,.60,.28,.04,.08),
("Etiopía","ETH","África",6,8,87,126,32,163,0,.90,0,.10,0),
("Egipto","EGY","África",180,250,82,112,220,395,.02,.45,.50,.03,0),
("Sudáfrica","ZAF","África",430,420,51,60,375,380,.75,.20,0,.05,0)]
with open("public/data/co2.csv","w",newline="",encoding="utf-8") as f:
    w=csv.writer(f); w.writerow("country,iso_code,continent,year,population,gdp,co2,coal_co2,oil_co2,gas_co2,cement_co2,flaring_co2".split(","))
    for n,iso,c,c0,c1,p0,p1,g0,g1,*s in D:
        for y in range(2010,2024):
            t=(y-2010)/13; L=lambda a,b:a+(b-a)*t
            co2=L(c0,c1)
            w.writerow([n,iso,c,y,round(L(p0,p1)*1e6),round(L(g0,g1)*1e9),round(co2,1)]+[round(co2*x,1) for x in s])
