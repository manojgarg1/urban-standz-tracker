import csv, io, json, re

csv_content = """Master Serial,Court,CCH,Judge,CNR,Registration No.,Plaintiff-1,Plaintiff-2,Defendant-1,Defendant-2,Advocate,Status,Stage,Filing Date,Next Hearing,Last Business,Linked Case
1,"Chief Judicial Magistrate, Bengaluru City",1031-XIX ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030881802026,C.C./64822/2026,GURUDATH G,,M/S URABN STANDZ PRIVATE LTD,NITHIN H,RAMKUMAR P K,Pending,SUMMONS,2026-09-26,2026-11-26,07/09/2026: ISSUE SS TO ACCUSED.,
2,"Chief Judicial Magistrate, Bengaluru City",1034-XXII,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030806142026,C.C./58978/2026,GEETHA Y M,,M/S URABN STANDZ PRIVATE LTD,NITHIN H,NITHYANANDA K R,Pending,SUMMONS,2026-09-07,2026-11-28,"07/09/2026: ISSUE SS TO ACCUSED.
31/10/2026: PO IS ON TRAINING. CALL ON.",
3,"Chief Judicial Magistrate, Bengaluru City",1032-XXII ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030781692026,C.C./57175/2026,Suresh,,M/S URABN STANDZ PRIVATE LTD,,C V SIJU,Pending,Summons,2026-08-31,2026-12-14,"31/08/2026: SUMMONS
11/11/2026: PO Is on leave",
4,"Chief Judicial Magistrate, Bengaluru City",1032-XXII ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030781452026,C.C./57160/2026,Suresh,,M/S URABN STANDZ PRIVATE LTD,,C V SIJU,Pending,Summons,2026-08-29,2026-12-14,"29/08/2026: SUMMONS
11/11/2026: PO is on Leave",
5,"Chief Judicial Magistrate, Bengaluru City",1348-XXXVI,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030711372026,C.C./51938/2026,SYED ABDUL MOID,,M/S URABN STANDZ PRIVATE LTD,NITHIN H,,Pending,Summons,2026-08-13,2026-11-16,25/09/2026: Counsel for complainant present. Reissue the same by,
6,"Chief Judicial Magistrate, Bengaluru City",1033-XXI ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030701292026,C.C./51095/2026,MURALIDHARA KARANAM,,M/S URABN STANDZ PRIVATE LTD,,SHYAM PRASAD T S,Pending,Summons,2026-08-12,2026-12-09,"12/08/2026: ISSUE SUMMONS TO ACCUSED.
01/09/2026: Await summons
17/09/2026 : SS NOT RETURNED. ISSUE FRESH SS IF PF PAID R/BY.",
7,"Chief Judicial Magistrate, Bengaluru City",1034-XXII ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030648202026,C.C./47267/2026,MRS L BHARATHI,,M/S URBAN STANDZ PRIVATE LIMITED,,MANJUNATH U N,Pending,Summons,2026-07-29,2026-12-03,"29/07/2026: Case is called out. Learned Counsel for plaintiff filed memo with original lease agreement. Office is hereby directed to keep original document in safe custody. Heard the arguments of Learned Counsel for plaintiff on IA No.1. For orders. Call 
31/08/2026: PO IS ON LEAVE. CALL ON.
31/10/2026: PO IS ON TRAINING. CALL ON.",
8,"Chief Judicial Magistrate, Bengaluru City",1034-XXII ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030614402026,C.C./44803/2026,MANOHAR M L,,M/S URABN STANDZ PRIVATE LTD,,GOPALA KRISHNA.B.N,Pending,Summons,2026-07-22,2026-12-24,"22/07/2026: ISSUE SS TO ACCUSED.
02/09/2026: Accused is called out absent. Issue NBW to accused.
07/11/2026: Re-issue NBW to accused.",
9,"Chief Judicial Magistrate, Bengaluru City",1033-XXI ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030494102026,C.C./35659/2026,RUHINA FIRDOSE,,M/S URABN STANDZ PRIVATE LTD,,RAJESH M D,Pending,Summons,2026-06-16,2026-12-18,"16/06/2026: issue summons to accsued.
18/07/2026: issue fresh summons to accused, if PF paid.
24/09/2026: Issue fresh summons to accused as per PF.",
10,"Chief Judicial Magistrate, Bengaluru City",65-IV ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030770202026,P.C.R./8205/2026,PAWAN PRASAD N,,URBAN STANDZ PRIVATE LIMITED,,,Pending,Summons,2026-08-28,2026-11-30,"28/09/2026: Complainant Counsel is present. Heard. In a reported judgment Om Prakash Ambadkar V/s State of Maharashtra and others (Criminal Appeal No.352/2020 dated 16.01.2025) the Honorable Supreme Court observed in paragraph No.31 magistrate is required to consider the submission of the officer incharge of the police station as regards refusal to register an FIR before issuing any direction u/s 175(3) of BNSS-2023. Issue notice to the SHO of Jayanagara PS to make submission u/s 175(3) as regards refusal to register an FIR based on the complaint lodged by the complainant dated 30.06.2026. Office is directed to send the notice along with the copy of the NCR dated 30.06.2026 for reference purpose to the SHO of Jayanagara PS. Complainant is directed to furnish a copy of the NCR dated 30.06.2026. For submission of the SHO of Jayanagara PS as provided u/s 175(3) by 11.11.2026.
11/11/2026: PO is on leave",
11,"Chief Judicial Magistrate, Bengaluru City",1409-XLVI ,ADDL CHIEF JUDICIAL MAGISTRATE,KABC030648972026,P.C.R./6989/2026,AZIT KUMAR MISHRA,,"URBAN STANDZ PVT LTD & Chetan Kumar V, Kiran Kumar V",,Ramesh Babu R,Pending,Call On,2026-07-29,2026-11-18,"10/08/2026: Comp is absent. N/R. To hear on complaint.
13/08/2026: Case is taken on board. Heard. For orders.
24/08: For orders
02/09: For orders
07/09: For sw/st
12/10/2026: Issue notice to accused No.1 to 3 on complaint. The complainant is directed to pay process fee.",
12,Principal City Civil & Sessions Court,17-CCH12 XVI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010298852026,O.S.	7280/2026,JEEWAN DAS MOHTA,RAKHI MOHTA,URBAN STANDZ PRIVATE LIMITED,JAYAMMA,SUNIL K N,Pending,Hearings,2026-09-26,2026-12-03,"28/09/2026: Case called. Plaintiff absent. No representation. To hear on office Objections. Call on 05-11-2026.
05/11/2026: Case called. Counsel for Plaintiff files memo with documents as per the list in compliance with office objections. Heard. In view of production of documents office is directed to issue Suit summons to defendant No.1 and 2 through Court and by speed post. Office to separate rental agreement and keep the same in safe lockers. Call on 03-12-2026.",
13,Principal City Civil & Sessions Court,8-CCH19 VII,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010292982026,O.S.7105/2026,BADRINATH R,,URBAN STANDZ PRIVATE LIMITED,PADMA B,Somana Gowda Patil,Pending,SUMMONS,2026-09-21,2027-01-27,"22/09/2026: Plaintiff is absent. His learned counsel is present. On his request, to comply with the office objections, call on 24.09.2026.
24/09/2026: Petitioner is absent. His learned counsel is present. In compliance of office objections, he has filed memo along with the notarized copy of SPA and stating that he is going to produce the original SPA in the connected O.S. No. 3709/2026 o the file of this Court, which is posted to 28.09.2026 and the other original documents are in possession of defendants. Therefore, keeping in abeyance, the office objections, call on 28.09.2026.
28/09/2026: Plaintiff is absent. His learned Counsel is present and in compliance of office objection, he has filed application under Section of 151 of CPC seeking dispensation of production of original Rental Agreement. It is I.A No.1. Since, it is stated in I.A No.1 that the original rent agreement is with the defendants, keeping open the office objections, office is directed to issue suit summons and notice on I.A No.1 to both the defendants both by Court and Speed Post if PF paid, post cover with stamps and acknowledgments as well as sufficient number of copies are furnished, returnable by 07.11.2026.
07/11/2026: Plaintiff is absent. His learned counsel is present. It is reported that the last date order is not complied for deficit of Rs.60/-. On the request of the learned counsel for plaintiff, office is directed to comply the last date order, if DPF is furnished well with in time, call on 27.01.2027.",
14,Principal City Civil & Sessions Court,17-CCH12 XVI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010286992026,O.S.	6937/2026,LALITHA NAGESH,,URBAN STANDZ PRIVATE LIMITED,HARRY,B.R.VISWANATH,Pending,SUMMONS,2026-09-16,2026-11-30,"17/09/2026: No representation for Plaintiff. To hear on office objection by 29-09-2026.
29/09/2026: Case called. Plaintiff absent. No representation. To hear on office Objections. Call on 16-10-2026.
16/10/2026: Case called. Plaintiff absent. No representation. To hear on office Objections. Call on 11-11-2026.
11/11/2026: Case called. Plaintiff absent No representation. To hear on office objections by 30.11.2026.",
15,Principal City Civil & Sessions Court,20-CCH18 XIX ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010284642026,O.S.6895/2026,YOGESH G V,,URBAN STANDZ PRIVATE LIMITED,RAJESH BABU G Y,MUDIT ASHUTOSH MUNDKUR,Pending,SUMMONS,2026-09-15,2026-12-05,"15/09/2026: Counsel for plaintiff filed I.A.No.1 under S.151 C.P.C. to dispense with the production of original documents for the time being. Perused. On satisfying with the reasons assigned in the affidavit, plaintiff is directed to produce the original documents at the time of evidence. Issue suit summons to defendants through Court. Call on 27.10.2026.
27/10/2026: Suit summons to defendant No.1 and 2 unserved. For steps against defendant No.1 and 2. Call on 05.12.2026.",
16,Principal City Civil & Sessions Court,13-CCH27 XII ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010269312026,O.S.6503/2026,AMOGH NAG,,URBAN STANDZ PRIVATE LIMITED,"NITHIN H, SHIVAKUMAR G ALIAS KARNA, MADAN RAJ M",CHANNAGANGAIAH G H,Pending,SUMMONS,2026-09-01,2026-12-11,"01/09/2026: L/c for the plaintiff present. Issue SS to the defendants. Call on 06-10-2026
06/10/2026: SS to the D.1 and 4 left the address and door locked respectively. Await SS to D.2 and 3. No representation on behalf of the plaintiff. For steps. Call on 11-12-2026",
17,Principal City Civil & Sessions Court,9-CCH15 VIII ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010267452026,O.S./6462/2026,Manoj Kumar Garg,Roopa Garg,URBAN STANDZ PRIVATE LIMITED,SUSHMITHA R,M Mahadevappa,Pending,Summons,2026-08-31,2026-11-28,"31/08/2026: Learned counsel appearing for plaintiffs is present. Issue suit summons to defendant No.1 to 3 through Court and speed post. R/by 13.10.2026.
13/10/2026: Suit summons of defendant No.1 to 3 are returned as unserved. Learned counsel appearing for plaintiff prays time. Reissue suit summons to defendant No.1 to 3 through speed post if required PF is paid. Call on 28.11.2026.",
18,Principal City Civil & Sessions Court,32-CCH14 XXXI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010263522026,O.S./6357/2026,SOUMYASHREE,NANDA KISHORE,URBAN STANDZ PRIVATE LIMITED,HIRISHA V,Rekha R,Pending,Summons,2026-08-27,2026-11-28,"27/08/2026: The plaintiff counsel present. Issue notice of I.A.No.1 and summons to defendants by 19.09.2026.
19/09/2026: Deficit PF paid. Issue notice of I.A.No.1 and summons to the defendants by 16.10.2026.
16/10/2026: Sri.K.T Advocate filed the memo undertaking to file the vakalath of defendant No.2. The plaintiff counsel filed I.A.No.2 under Order 5 Rule 20 of CPC to issue summons to the defendant No.1 through publication in Samyuktha Karnataka. Perused the endorsement of the Bailiff and postal endorsement. The grounds to issue summons through paper publication is made out. Accordingly, I.A.No.2 is allowed. Issue summons to defendant No.1 through paper publication. Office is to verify the draft furnished by the plaintiff and give for publication by 28.11.2026.",
19,Principal City Civil & Sessions Court,23-CCH7 XXII ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010255522026,O.S./6162/2026,MRUDULA S,,URBAN STANDZ PRIVATE LIMITED,RAGHAVENDRA,KRISHNAMOORTI L BHAT,Pending,Summons,2026-08-18,2027-01-06,"19/08/2026: Case called out. Issue Suit summons to defendant no.1 and 2. Returnable by 24.09.2026.
24/09/2026: Case called out. Suit summons to defendant no.1 unserved as he left address. To furnish correct address of defendant no.1 and await Suit summons of defendant no.2 by 12.11.2026.
12/11/2026: Case called out. Suit summons to defendant no.2 unserved. Learned Counsel for plaintiff prays time. Plaintiff is directed to furnish correct address of defendant no.1 and 2 for steps by 06.01.2027.",
20,Principal City Civil & Sessions Court,2-CCH5 IX,ADDL. CITY CIVIL AND SESSONS JUDGE,KABC010248422026,O.S./5965/2026,CHETHAN R K,,URBAN STANDZ PRIVATE LIMITED,Vasanthi Prasad,VISHWANATH N,Pending,,2026-08-12,2027-01-25,"12/08/2026: Heard the advocate on IA No.1. For orders. Call on 13.08.2026.
13/08/2026: O R D E R Issue an ad-interim order of temporary injunction restraining the defendant his men, agents, or any persons claiming through the defendants from interfering or dispossessing the plaintiff from the schedule property except the due process of law. The plaintiff shall comply the provisions under Order 39 Rule 3 of CPC. Issue emergent notice on I.A. No.1 and suit summons to the defendant No.1 Returnable by 05.11.2026.
05/11/2026: Plaintiff counsel files application u/s. 151 of CPC for the extension of TI. Perused and allowed. TI is extended till next hearing date. Sri.SVR advocate filed vakalath for the D2 and prays time for WS and objections. Reissue emergent notice on IA No.1 and SS to the D1thrugh speed post. Returnable by 25.01.2027.",
21,Principal City Civil & Sessions Court,2-CCH5 IX ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010246002026,O.S./5916/2026,MERLYN WILSON,,URBAN STANDZ PVT LTD & ,"BELLANA RAMAKRISHNA REDDY,
SATIDEVI RAMAKRISHNA",THOMAS V PETER,Pending,,2026-08-11,2027-01-25,"12/08/2026: Both the parties are directed to maintain the statusquo with respect to the schedule property till next date of hearing. The plaintiff shall comply the provisions under order 39 rule 3 of CPC. Issue emergent notice on IA No.1 and suit summons to the defendant Rtb bu 27.10.2026.
27/10/2026: Plaintiff counsel files application u/s. 151 of CPC for the extension of TI. Perused and allowed. TI is extended till next hearing date. Advocate for the plaintiff is present. Sri.LTS Advocate filed memo of undertaking on behalf of D2 and 3 and undertakes to file vakalath on next date of hearing. Reissue notice on IA No.1 and SS to D1 through speed post if PF paid. Returnable by 25.01.2027",
22,Principal City Civil & Sessions Court,10-CCH2 I,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010241672026,O.S./5824/2026,RAMKUMAR SAMBASIVAN,,URBAN STANDZ PVT LTD,STEPHEN JACKAYYA,B.R.VISWANATH,Pending,Summons,2026-08-06,2026-11-26,"07/08/2026: Case called. Keeping open the office objection. Issue summons to defendants. Call on 01.09.2026.
01/09/2026: Case called. Summons to defendant No.1and 2 unserved. Re-issue summons to defendants through court and speed post, if PF and postage paid. Call on 29.10.2026.
29/10/2026: Case called. Sri. KVR Advocate filed vakalath for defendant No.2 and prays time for written statement. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 26.11.2026.",
23,Principal City Civil & Sessions Court,17-CCH12 XVI,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010241572026,O.S./5822/2026,SARANYA,,URBAN STANDZ PVT LTD,SHANTHI V,D V VENKATESH,Pending,Notice,2026-08-06,2026-12-17,"07/08/2026: Case called to hear on office objections Call on 18.08.2026
18/08/2026: Case called. Plaintiff absent. No representation. Finally to hear on office Objections. Call on 23-09-2026.
23/09/2026: Case called. Counsel for Plaintiff files a memo with original rental agreement in compliance with office Objections. Issue Suit summons to defendants through Court and by Speed post. Office to separate original rental agreement and keep the same in safe lockers. Call on 02-11-2026.
02/11/2026: Case called. Counsel for Plaintiff present. Re-issue Suit summons to defendants through Court and by speed post. Call on 17-12-2026.",
24,Principal City Civil & Sessions Court,32-CCH14 XXXI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010240942026,O.S./5795/2026,SUMAN SARKAR,,URBAN STANDZ PVT LTD,POLLA NARASIMHA RAO,VISHWANATH N,Pending,Summons,2026-08-06,2026-11-18,"06/08/2026: Heard on I.A.No.1. For orders on I.A.No.1 by 07.08.2026.
07/08/2026:  Exparte T I as prayed in I.A No.I granted to the effect that, the defendants, their agents or representatives or anybody claiming under them from dispossessing the plaintiffs from the suit schedule premises otherwise than by due process of law, till the next date of hearing. Issue ex-parte temporary injunction order, suit summons and notice on I.A. No.I to the defendants, subject to compliance with Order XXXIX Rule 3(a) of the Code of Civil Procedure and on payment of the requisite process fee. Returnable by 19.09.2026.
19 Sep 2026: Existing T.I is extended till next date of hearing. The notice issued to defendant No.1 returned unserved as company left the address. Summons issued to defendant No.2 returned unserved as door number not found. For taking steps by 17.10.2026.
17/10/2026: Existing T.I is extended till next date of hearing. For taking steps prays time finally by 18.11.2026.",
25,Principal City Civil & Sessions Court,846-CCH44 XLIII,ADDL CHIEF JUDICIAL MAGISTRATE,KABC010237902026,O.S./5713/2026,GANESH M,"BINDHU M,
VARNA GOWDA G",URBAN STANDZ PRIVATE LIMITED,SUNITHA  REDDY R,NAVEEN KUMAR R C,Pending,Summons,2026-08-04,2026-11-16,"05/08/2026: Issue suit summons to defendant. Call on 11.09.2026.
11/09/2026: Pending clerk has not issues suit summons. Issue suit summons to defendant. Call on
15/10/2026: For steps. Call on",
26,Principal City Civil & Sessions Court,32-CCH14 XXXI,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010234912026,O.S./5641/2026,ROOPA G,,URBAN STANDZ PRIVATE LIMITED,NETHRAVATHI P,GAYATHRI.T.N,Pending,,2026-08-01,2026-11-28,"03/08/2026: O.S. 5641/2026 Heard on I.A.No.1. For orders on I.A.No.1 by 04.08.2026.
04/08/2026: Exparte T I as prayed in I.A No.I granted to the effect that, the defendants, their agents, servants, workers, henchmen, officials or anybody claiming through or under them are hereby restrained by an ex-parte order of temporary injunction from evicting the plaintiff from the suit schedule property otherwise than by due process of law, till the next date of hearing. Issue ex-parte temporary injunction order, suit summons and notice on I.A. No.I to the defendants, subject to compliance with Order XXXIX Rule 3(a) of the Code of Civil Procedure and on payment of the requisite process fee. Returnable by 29.08.2026.
29/08/2026: Existing T.I is extended till next date of hearing. For defendant No.2 Sri.HMM Advocate filed the vakalath of the GPA Holder of the defendant No.2 with I.A.No.2 under Order 3 Rule 2 Read with Section 151 of CPC. Allowed. Issue summons to defendant No.1 by using the PF already paid by 05.10.2026.
05/10/2026: Existing T.I is extended till next date of hearing. Summons issued to defendant No.1 returned unserved as addressee left. For written statement and objection to I.A.No.1 defendant No.2 counsel prays time/ steps to defendant No.1 by 29.10.2026.
29/10/2026: Existing T.I is extended till next date of hearing. The defendant No.2 counsel prays time to file the written statement, for taking steps against defendant No.1 prays time by 28.11.2026.",
27,Principal City Civil & Sessions Court,10-CCH2 I ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010234382026,O.S./5630/2026,SHOBHA R CHANDRA,,URBAN STANDZ PRIVATE LIMITED,DEVARAJU V BETAGERI,GURUCHARAN N,Pending,Summons,2026-08-01,2026-12-01,"01/08/2026: Case called. Keeping open the office objections. Issue suit summons and notice on I.A. No.1 to defendants through court and speed post, if PF and postage paid. Call on 27.08.2026.
27/08/2026: Case called. Sri. RR Advocate filed vakalath for defendant No.2 and prays time for written statement. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 18.09.2026.
18/09/2026: Case called. Summons to defendant No.1 unserved. Advocate for Plaintiff prays time for steps. Call on 30.09.2026.
30/09/2026: Case called. Advocate for Plaintiff filed I.A No.2 U/o 5 rule 20 of CPC with a prayer to permit the Plaintiff to take steps against defendant No.1 by way of substitute service i.e., publication of summons in Indian Express daily news paper. Heard. Perused, inspite of taking steps through court and RPAD defendant No.1 not served. Hence, I.A. No.2 is allowed. Issue summons to defendant No.1 through paper publication, if draft found correct. Advocate for defendant No.2 prays time for written statement. Call on 13.11.2026.
13/11/2026: Case called. Advocate for Plaintiff filed a memo along with The New Indian Express daily dt.13.10.2026 and Kannada Prabha daily dt.13.10.2026 wherein, summons to defendant No.1 published. Service held sufficient. Defendant No.1 called absent, placed exparte. Advocate for defendant No.2 prays time for written statement and objection to I.A. No.1. Sufficient time is granted. No grounds, prayer rejected. Written statement and objection to I.A. No.1 of defendant No.2 taken as not filed. Posted for Plaintiff's evidence and hearing on I.A. No.1. Call on 01.12.2026.",O.S./4614/2026
28,Principal City Civil & Sessions Court,10-CCH2 I ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010234342026,O.S./5629/2026,SHOBHA R CHANDRA,,URBAN STANDZ PRIVATE LIMITED,UMESH K,GURUCHARAN N,Pending,Summons,2026-08-01,2026-12-01,"01/08/2026: Case called. Keeping open the office objections. Issue suit summons and notice on I.A. No.1 to defendants through court and speed post, if PF and postage paid. Call on 27.08.2026.
27/08/2026: Case called. Sri. RR Advocate filed vakalath for defendant No.2 and prays time for written statement. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 18.09.2026.
18/09/2026: Case called. Summons to defendant No.1 through court process unserved. Await summons to defendant No.1 through speed post. Call on 30.09.2026.
30/09/2026: Case called. Summons to defendant No.1 issued through speed post not returned. Advocate for Plaintiff filed I.A No.2 U/o 5 rule 20 of CPC with a prayer to permit the Plaintiff to take steps against defendant No.1 by way of substitute service i.e., publication of summons in Indian Express daily news paper. Heard. Perused, inspite of taking steps through court and RPAD defendant No.1 not served. Hence, I.A. No.2 is allowed. Issue summons to defendant No.1 through paper publication, if draft found correct. Advocate for defendant No.2 prays time for written statement. Call on 13.11.2026.
13/11/2026: Case called. Advocate for Plaintiff filed a memo along with The New Indian Express daily dt.13.10.2026 and Kannada Prabha daily dt.13.10.2026 wherein, summons to defendant No.1 published. Service held sufficient. Defendant No.1 called absent, placed exparte. Advocate for defendant No.2 prays time for written statement and objection to I.A. No.1. Sufficient time is granted. No grounds, prayer rejected. Written statement and objection to I.A. No.1 of defendant No.2 taken as not filed. Posted for Plaintiff's evidence and hearing on I.A. No.1. Call on 01.12.2026.",O.S./4613/2026
29,Principal City Civil & Sessions Court,30-CCH30 XXIX ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010216132026,O.S./5231/2026,DAVID JAI KUMAR J,,URBAN STANDZ PRIVATE LIMITED,BALAJI RAGHAVENDRA T,VISHWANATH N,Pending,Summons,2026-07-10,2026-11-24,"20/07/2026: Heard the arguments on I.A. No.2. Case posted for orders by 21.07.2026.
21/07/2026: It is restraining the defendant No.1 and 2 from dispossessing the plaintiff from the suit schedule premises illegally without due process of law till next date of hearing. The plaintiff is directed to shall comply the provisions of Order XXXIX Rule 3 of C.P.C. Issue suit summons and notice of Order on I.A. No.I to the defendant No.1 and 2 R/by 24.08.2026.
24/08/2026: Plaintiff counsel filed application for extension of interim order. Perused. Interim order extended till next date of hearing. Suit summons to defendant No.1 unserved. Await suit summons of defendant No.2. Steps to defendant No.1 prays time. Call on 12.10.2026.
12/10/2026: Plaintiff counsel filed application under Section 151 of CPC for extension of interim order. Heard. Allowed. Interim order is extended till next date of hearing. Steps taken. Re-issue suit summons to defendant No.1 and 2 through court R/by 24.11.2026.",
30,Principal City Civil & Sessions Court,23-CCH7 XXII ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010214502026,O.S./5189/2026,NAGABHUSHANA K,,URBAN STANDZ PRIVATE LIMITED,MANJULA S R,Kiran Kumar H,Pending,Objection,2026-07-18,2026-11-25,"18/07/2026: To comply office objection by 29.07.2026.
29/07/2026: Case called out. Learned Counsel for plaintiff submits rental agreement is with the defendants, hence he has produced copy of rental agreement. Considering the submission of Learned Counsel for plaintiff, office is directed to issue Suit summons to defendant no.1 and 2 through speed post, if furnished. Returnable by 31.08.2026.
31/10/2026: PO is on leave. Hence case is adjourned. Call on
15/10/2026: Case called out. Sri.MJ., Advocate filed vakalath for defendant no.2, same is taken on record. He prays time. Suit summons to defendant no.1 unserved as he left the address. Learned Counsel for plaintiff prays to reissue Suit summons. Reissue Suit summons to defendant no.1 through speed post, if furnished. Returnable by and for Written statement of defendant no.2 by 25.11.2026.",
31,Principal City Civil & Sessions Court,25-CCH6 XXIV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010197832026,O.S./4833/2026,BHARATHI C S,,URBAN STANDZ PRIVATE LIMITED,ARVIND MALI PATIL,SHIVARAJ,Pending,Summons,2026-07-07,2026-11-30,"07/07/2026: Plaintiff Counsel present. Heard the arguments of plaintiff Counsel on IA.No.1. Call on for orders on IA.No.1 by 08.07.2026.
08/07/2027: ORDER ON IA No.I Heard Learned Counsel for Plaintiffs on IA No.I. 2.Perused the plaint averments, IA No.I, affidavit annexed thereto and documents along with plaint. 3.Plaintiff has filed this I.A u/o XXXIX Rule 1 and 2 r/w Sec 151 of C.P.C praying for ad-interim ex-parte temporary injunction restraining the defendant, her agents,servants, representatives or any person claiming through or under them from interfering with the plaintiffs peaceful possession and enjoyment of the suit schedule property and dispossessing the plaintiff in any manner whatsoever, pending disposal of the suit. 4. After perusal of averments in the plaint as well as in the application and after hearing the Learned Counsel for the plaintiff and on considering the materials available on record, this court deems it just and proper to hear other side before passing ex-parte ad-interim temporary injunction. Hence, issue emergent notice of IA No.I along with suit summons to the defendants,Returnable by 
07.08.2026.Plaintiff Counsel present and submitted that defendants are avoiding suit summons and are interfering in plaintiffs possession by coming to the suit property and prayed for passing necessary interim orders.
12/08/2026: Plaintiff Counsel present and submitted pen drive regarding the conversation between plaintiff and defendant No.2 and submitted that defendants are intentionally avoiding the suit summons and trying to forcibly dispossess the plaintiff from the suit property. Hence, prayed for passing necessary orders accordingly. Heard the arguments of on IA.No.1. Kept by for orders. Defendants, their agents, representatives or any person claiming through or under them are hereby restrained by way of Ad-interim Exparte Temporary Injunction from in any way interfering with the plaintiffs peaceful possession and enjoyment of the suit schedule property and from the dispossessing the plaintiff from the suit schedule property without due process of Law till next date of hearing as prayed in IA No.I. Plaintiff shall comply with the provisions u/o XXXIX Rule 3(A) of C.P.C. Issue suit summons, notice of IA No.I along with T.I notice to defendants if P.F is paid r/by 11.09.2026.
11/09/2026: Plaintiff Counsel present. Counsel for plaintiff files application u/S 151 of CPC, seeking extension of I.O. Perused, same is allowed interim order extended. Sri.SSH Advocate filed vakalath on behalf of defendant No.2 and filed written statement in two sets along with list of documents and filed IA.No.2 U/o. 39 Rule 4 r/w Sec 151 CPC and filed IA.No.3 U/o. 39 Rule 1 and 2 r/w Sec 151 CPC and filed memo adopting written statement as objections to IA.No.1. Copy served. Plaintiff Counsel prays time for objections to IA.Nos.2 and 3. Call on for objections to IA.Nos.2 and 3 and Re-issue suit summons and IA notice to defendant No.1 through court and RPAD / Speed post, r/by 28.09.2026.
28/09/2026: Both counsels present. Counsel for plaintiff files application u/S 151 of CPC, seeking extension of I.O. Perused, same is allowed interim order extended. Counsel for defendant No.2 filed memo praying for dismissing IA.No.3 as not pressed with liberty to file fresh application. Perused the memo, same is accepted. IA.No.3 is dismissed as not pressed. Plaintiff Counsel filed rejoinder to the written statement of defendant No.2 along with IA.No.4 U/o. 8 Rule 9 r/w Sec 151 CPC seeking permission to submit the same. Counsel for defendant No.2 submitted that IA.No.4 may be allowed. Perused IA.No.4, same is allowed. Rejoinder of plaintiff taken on record. Counsel for defendant No.2 filed IA.No.5 U/s. 151 CPC along with additional written statement with counter claim, valuation slip, list of documents, Certificate U/sec.63 of BSA 2023 and also filed IA.No.6 U/o. 39 Rule 1 and 2 r/w Sec 151 CPC. Plaintiff Counsel prays time for objections to IA.Nos.5 and 6. Call on for objections to IA.Nos.5 and 6 by 13.10.2026.
13/10/2026: Both counsels present. Counsel for plaintiff files application u/S 151 of CPC, seeking extension of I.O. Perused, same is allowed interim order extended. Defendant Counsel filed memo praying for dismissing IA.No.6 as not pressed. Perused the memo, same is accepted. Accordingly, IA.No.6 is dismissed as not pressed. Plaintiff Counsel filed objections to IA.No.5. Copy served. Heard the arguments of both sides on IA.No.5. Call on for orders on IA.No.5 by 02.11.2026.
02/11/2026: Call on for orders by 30.11.2026.",
32,Principal City Civil & Sessions Court,15-CCH28 XIV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010193252026,O.S./4723/2026,MANJUNATH N,,URBAN STANDZ PRIVATE LIMITED,SHRUTHI P V,B.R.VISWANATH,Pending,Notice,2026-07-03,2026-12-02,"03/07/2026: Matter called out. No representation. Plaintiff to comply with the office objections by 18.07.2026.
18/07/2026: Counsel for plaintiff is present and prays time for compliance of office objections by 29-07-2026.
29/07/2026: Matter called out. No representation. For compliance of office objections by 31.08.2026.
31/08/2026: Matter called out. Counsel for the plaintiff is present. In compliance of office objections Counsel for the plaintiff furnishes tax paid receipts and Katha certificates and submits that the original rental agreement is with the defendant hence to that extent keeping open the office objections. Issue SS to defendant r/by 09.10.2026.
09/10/2026: Matter called out. Sri.P.M.C files power for defendant no.2. Hence for Written statement of defendant no.2 and also await SS of defendant no.1 by 11.11.2026.
11/11/2026: Matter called out. Counsel for defendant is present and files application under sec.148 of CPC for Written statement. Hence time enlarged for Written statement. For Written statement of defendant and also await summons of defendant r/by 02.12.2026",
33,Principal City Civil & Sessions Court,4-CCH25 III,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010193282026,O.S./4721/2026,AKHILA V DEV,MANJUNATH N,URBAN STANDZ PRIVATE LIMITED ,MANOHAR M L,B.R.VISWANATH,Pending,Summons,2026-07-03,2026-11-30,"03/07/2026: Learned counsel for plaintiff absent. Issue Suit summons to Defendant No.1 and 2, r/by 06.08.2026.
06/08/2026: Case called out. Sri. BNG advocate filed vakalath for defendant No. 2. For Written statement and objection to Defendant No.2. Re-issue suit summons to Defendant No.1 if PF paid and correct address. Call on 09.09.2026.
09/09/2026: Learned counsel for plaintiff present and files IA U/S 151 of CPC for extension of IO. IO extended till the next date of hearing. Learned counsel for defendant No.2 present and files an application u/sec 148 of CPC, the same is allowed. For Written statement and objections of Defendant No.2, Re issue suit summons to defendant No.1 through court and speed post acknowledgment due, if PF paid and correct address furnished, r/by 30.10.2026.
30/10/2026: Learned counsel for defendant No.2 present and files Written statement in 2 sets. Learned counsel for plaintiff present. Steps taken along with RPAD covers furnished. Re issue suit summons to defendant No.1 through speed post acknowledgment due, r/by 30.11.2026.",
34,Principal City Civil & Sessions Court,10-CCH2 I ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010185872026,O.S./4614/2026,DEVARAJU V BETAGERI,,URBAN STANDZ PRIVATE LIMITED,SOBHA R CHANDRA,Rakshith R,Pending,Summons,2026-06-30,2026-12-03,"30/06/2026: Case called. Advocate for Plaintiff filed memo with document in compliance of office objection. Heard on I.A. No.1. Posted for orders. Call on 01.07.2026.
01/07/2026: Case called. Perused the record. The plaintiff has filed this suit for injunction stating that, he is lessee under defendant No.1 to whom defendant No.2 being the property owner authorized to lease. Accordingly on 22.01.2025 defendant No.1 received the sum of Rs.20,00,000/- and executed lease deed for a period of 3 years and put the Plaintiff in possession of schedule property. Now defendants are trying to dispossess of the plaintiff. Along with the plaint, plaintiff filed IA No.1 under Order 39 Rule 1 and 2 r/w Sec.151 of CPC with prayer to restrain the defendants or anybody acting on their behalf from interfering with Plaintiff's peaceful possession and enjoyment of suit schedule property, pending disposal of this suit. Perused the documents. The rent / lease agreement is still inforce. Plaintiff has made out prima facie case if the exparte TI is not granted, plaintiff's will be put to hardship. Hence, I proceed to pass the following: ORDER Ex-parte TI as prayed in I.A. No.1 is granted restraining the defendants or anybody acting on their behalf from interfering with plaintiff's peaceful possession and enjoyment of suit schedule property, till next date of hearing or filing of objections, whichever is earlier. Issue TI notice on I.A.No.1 and suit summons to the defendants, subject to compliance of O.39 R.3-A of CPC. Call on 10.08.2026.
10/08/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Sri. KVS Advocate filed vakalath for defendant No.2 and prays time for written statement. Re-issue summons to defendant No.1, if PF paid. Call on 27.08.2026.
27/08/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 prays time for written statement. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 18.09.2026.
18/09/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 filed application U/s 148 of CPC, with a prayer to extend time to file written statement, Time granted. Summons to defendant No.1 unserved. Advocate for Plaintiff prays time for steps to defendant No.1. Call on 16.10.2026.
16/10/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 filed application U/s 148 of CPC, with a prayer to extend time to file written statement, Time granted. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 03.12.2026.",O.S./5630/2026
35,Principal City Civil & Sessions Court,10-CCH2 I ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010185812026,O.S./4613/2026,UMESH K,,URBAN STANDZ PRIVATE LIMITED,SOBHA R CHANDRA,Rakshith R,Pending,Summons,2026-06-30,2026-12-03,"30/06/2026: Case called. Advocate for Plaintiff filed memo with document in compliance of office objection. Heard on I.A. No.1. Posted for orders. Call on 01.07.2026.
01/07/2026: Case called. Perused the record. The plaintiff has filed this suit for injunction stating that, he is lessee under defendant No.1 to whom defendant No.2 being the property owner authorized to lease. Accordingly on 16.02.2024 defendant No.1 received the sum of Rs.19,00,000/- and executed lease deed for a period of 3 years from 10.02.2024 to 09.02.2027 and put the Plaintiff in possession of schedule property. Now defendants are trying to dispossess of the plaintiff. Along with the plaint, plaintiff filed IA No.1 under Order 39 Rule 1 and 2 r/w Sec.151 of CPC with prayer to restrain the defendants or anybody acting on their behalf from interfering with Plaintiff's peaceful possession and enjoyment of suit schedule property, pending disposal of this suit. Perused the documents. The rent / lease agreement is still inforce. Plaintiff has made out prima facie case if the exparte TI is not granted, plaintiff's will be put to hardship. Hence, I proceed to pass the following: ORDER Ex-parte TI as prayed in I.A. No.1 is granted restraining the defendants or anybody acting on their behalf from interfering with plaintiff's peaceful possession and enjoyment of suit schedule property, till next date of hearing or filing of objections, whichever is earlier. Issue TI notice on I.A.No.1 and suit summons to the defendants, subject to compliance of O.39 R.3-A of CPC. Call on 10.08.2026.
10/08/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Sri. KVS Advocate filed vakalath for defendant No.2 and prays time for written statement. Re-issue summons to defendant No.1, if PF paid. Call on 27.08.2026
27/08/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 prays time for written statement. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 18.09.2026.
18/09/2026: Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 filed application U/s 148 of CPC, with a prayer to extend time to file written statement, Time granted. Summons to defendant No.1 unserved. Advocate for Plaintiff prays time for steps to defendant No.1. Call on 16.10.2026.
16/10/2026:  Case called. The advocate for Plaintiff filed application U/sec.151 of CPC with a prayer to extend interim order. Heard. Interim order is extended till next date. Advocate for defendant No.2 filed application U/s 148 of CPC, with a prayer to extend time to file written statement, Time granted. Re-issue summons to defendant No.1 through court and speed post, if PF and postage paid. Call on 03.12.2026.",O.S./5629/2026
36,Principal City Civil & Sessions Court,4-CCH25 III,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010182332026,O.S./4528/2026,RAJESH BABU G Y,,URBAN STANDZ PRIVATE LIMITED,YOGESH G V,VISHWANATH N,Pending,Summons,2026-06-27,2026-11-20,"27/06/2026: Learned Counsel for Plaintiff present. Heard on IA.No.1 and 2. For orders by 30.06.2026.
30/06/2026: Learned counsel for plaintiff present. Sri Abhishek D.S advocate files memo of undertaking for Defendant No.2. and files memo stating that a caveat was also pending, copy of memo furnished to plaintiff counsel. For filing of vakalath and Written statement and objections of Defendant No.2 and issue emergent notice on IA.No.1 and Suit summons to Defendant No.1, r/by 03.07.2026.
03/07/2026: Learned counsel for plaintiff present. Sri.ADS files power for defendant No.2 along with objections to IA.No.2 with documents, copy furnished to other side. Heard from plaintiff side on IA.No. 2. Counsel for Defendant No.2 prays time to hear on IA.No.2 by 06.07.2026.
06/07/2026: Learned counsel for plaintiff present. Learned counsel for defendant No.2 present. Heard on IA.No. 1 and 2 both sides. For orders by 18.07.2026.
18/07/2026: I.A.No.2 filed by the plaintiff under Order XXXIX Rule 1 and 2 r/w Sec.151 of CPC is hereby allowed. The defendants or their agents or representatives or anybody claiming under them are restrained by way of temporary injunction from dispossessing the plaintiff from the suit schedule premises illegally, without due process of law, till the disposal of the suit. For Written statement and objections of Defendant No.2 and for steps to Defendant No.1 by 07.08.2026.
07 Aug 2026: Case called out. For Written statement and objections Defendant No.2 Steps to Defendant No.1. Call on 01.09.2026.
01/09/2026: Learned counsel for defendant No.2 present and files Written statement in 2 sets along with list of documents, copy furnished to other side. Learned counsel for plaintiff present. Steps taken. Re issue Suit summons to Defendant No.1 through court, r/by 29.09.2026
29/09/2026: Learned counsel for defendant No.2 present. Learned counsel for plaintiff present and prays time for steps with correct address to Defendant No.1 by 29.10.2026.
29/10/2026: Learned counsel for defendant No.2 present. Learned counsel for plaintiff present and submits there is an element of settlement. Steps taken. Call on for reporting settlement by 20.11.2026.",
37,Principal City Civil & Sessions Court,13-CCH27 XII ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010168062026,O.S./4229/2026,AMARNATH KRISHNASAMY,,URBAN STANDZ PRIVATE LIMITED,SWATHI SINDHU and Madhu Sindhu,Parashuram R hattarakihal,Pending,Summons,2026-06-17,2026-11-23,"17/06/2026: L/c for the plaintiff files memo along with original lease agreement dt 07.09.2025 in compliance of the office objection. Directed the office to keep the original above said lease agreement in the safe custody of this court. Heard the arguments of L/d counsel for the plaintiff on IA.No. 1. Posted for Orders on IA.No. 1. Call on 18-06-2026
18/06/2026: IA no.1 filed by the plaintiff is hereby allowed, until appearance of defendants. Office is to issue SS and notice on TI to the defendants. Call on 06-08-2026
06/08/2026: Advocate for plaintiff filed I.A. U/Sec. 151 of CPC for extension of I.O. Heard. Perused. Hence, I.A. is allowed and I.O. extended till further orders. Reissue SS to the D.1,3 through speed post. If PF paid. L/c for the D.2 files objection to IA.No. 1 and files IA.No.2 U/s 148 of CPC by seeking extension of time for filing WS. However with an intend to give an opportunity to file WS granted time Call on 02-09-2026
02/09/2026: L/c for the plaintiff and D.2 present. Sri AMC files vakalath for the D.3 and prays time to file Written Statement and objection to IA.No. 1. L/c for the D.2 and 3 files IA.No. 3 files the application U/s 148 of CPC by seeking extension of time for filing WS. However with an intend to give an opportunity to file WS granted time Reissue SS to the D.1. Call on 16-09-2026
16/09/2026: P.O is on leave, hence case is adjourned. Call on
25/09/2026: SS to the defendant no.1 unserved as addressee left. L/c for the D.2 and 3 files IA.No. 4 U/s 151 of CPC by seeking permission to file Written Statement along with counter claim along with valuation slip and court fee. On perusal of the order sheet D.2 came on record on 02.07.2026 and filed vakalath for D.3 on 02.09.2026 before the service of D.2 and 3 they appeared before this court and vakalath, as per order 8 R 1 of CPC 90 days not yet expired, thus IA.No. 4 is hereby allowed, Written Statement of the D.2 and 3 taken on record along with counter claim in duplicate. L/c for the D.2 and 3 files memo along with DD bearing no.151268, dt 15.09.2026, drawn on Kotak Mahindra Bank towards court fee on counter claim. Directed the office to receive the DD and deposit the same into the account of this court. L/c for the plaintiff prays time for steps against D.1. Call on 23-11-2026",
38,Principal City Civil & Sessions Court,26-CCH23 XXV,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010148352026,O.S./3776/2026,SUSHMITHA R,,URBAN STANDZ PRIVATE LIMITED,MANOJ KUMAR GARG,Parashuram R hattarakihal,Pending,Summons,2026-06-01,2026-12-09,"02/06/2026: ORDER Pending consideration of I.A Nos.I the defendant or anybody claiming through him are hereby restrained from interfering with plaintiffs peaceful possession and enjoyment of property till next date of hearing. Issue exparte order of Temporary injunction, if order 39 Rule 3 of CPC is complied. Issue emergent notice on I.A No.I and suit summons to the defendant returnable by 21.07.2026.
10/06/2026: Case is advance. Sri R.T.K. for plaintiff is present and filed I.A. U/s 151 of C.P.C. and submits that due to ill health of his senior counsel the order of 39 Rule 3 of CPC is not complied on the same day. Hence, prayed for condone the delay and issue T.I. order to defendants. Heard. Perused, satisfied. Hence, I.A. is allowed. Delay in compliance is condoned. Issue order of T.I. on I.A.No.I and suit summons to defendant, if PF paid. Call on same hearing date.
21/07/2026: Plaintiff counsel filed IA under Sec.151 of CPC for seeking extension of IO. Heard, perused and satisfied. Hence IA is allowed. IO is extended till next date of hearing. Sri MM files vakalath for Defendant No.2 and also filed written statement along with 2 sets. Sri MM for Defendant No.2 also filed memo to adopt written statement as objections to IA No. 1. Memo is accepted and written statement of Defendant No.2 is also taken as objections to IA No. 1. For steps against Defendant No.1. Call on 18-08-2026
18/08/2026: Both learned counsels for Plaintiff and Defendant are present. Plaintiff counsel filed IA under Sec.151 of CPC for seeking extension of IO. Heard, perused and satisfied. Hence IA is allowed. IO is extended till next date of hearing. Reissue summons to defendant No.1 through speed post if PF paid. Call on 07-10-2026
07/10/2026: Both learned counsels for Plaintiff and Defendant are present. Plaintiff counsel filed IA under Sec.151 of CPC for seeking extension of IO. Heard, perused and satisfied. Hence IA is allowed. IO is extended till next date of hearing. Reissue summons to defendant No.1 through speed post if PF paid. Call on 09-12-2026",
39,Principal City Civil & Sessions Court,32-CCH14 XXXI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010146982026,O.S./3735/2026,ZAINAB TANVEER,,URBAN STANDZ PRIVATE LIMITED,RIZWAN ALIAS RIZWAN MASOOD ALI,Syeda Shehnaz,Pending,Summons,2026-06-01,2026-12-07,"02/06/2026: Plaintiff counsel present and produced the documents with a memo and same is kept in the file. The plaintiff counsel addressed the argument on I.A.No.1 wherein exparte T.I is sought. For orders by 03.06.2026.
03/06/2026: Ex-parte Temporary Injunction, as sought in I.A.No.I, is granted till next date of hearing. Issue ex-parte Temporary Injunction order, suit summons and notice on I.A.No.1 to the defendants, subject to compliance with Order XXXIX Rule 3(a) of CPC and after confirming that required process fee is paid. Returnable by 09.07.2026.
09/07/2026: O.S. 3735/2026 Existing T.I is extended till next date of hearing. deficit process fee Rs.17/- is paid. Issue notice of I.A.No.1 and summons to the defendants by 19.08.2026.
19/08/2026: Existing T.I is extended till next date of hearing. Issue summons to the defendants through speed post by 28.09.2026.
28/09/2026: Existing T.I is extended till next date of hearing. Issue summons and notice of I.A.No.1 to the defendants by 13.11.2026.
13/11/2026: Existing T.I is extended till next date of hearing. Summons and notice of IA no.1 returned unserved as address vacated and door locked. For steps by 07.12.2026.",
40,Principal City Civil & Sessions Court,20-CCH18 XIX,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010146632026,O.S./3723/2026,AMOGH NAG,,URBAN STANDZ PRIVATE LIMITED,MANJUNATH HANUMAIAH,Lohith Kumar G.C,Pending,Hearings,2026-06-01,2026-11-15,"02/06/2026: Case called out. Counsel for plaintiff present and produced originals of documents at Annexure - B and C'. Perused, the originals are returned back to the Plaintiff to produce original at the time of evidence. According to the Plaintiff, the document at annexure &ndash; A is in possession of defendant No.2. In view of the said submission, the office objection raised pertains to Annexure &ndash; A is over ruled. To hear on I.A.No.1. Call on 03.06.2026.
03/06/2026: Counsel for Plaintiff files memo with list of documents. Heard arguments of Plaintiff on I.A.No.1. For orders on I.A.No.1. Call on 04.06.2026.
04/06/2026: Issue ad-interim exparte temporary injunction order against defendants restraining them from dispossessing the plaintiff from the suit schedule residential premises and also from interfering with the plaintiff&rsquo;s peaceful possession without due process of law till next date. In view of the above said order, plaintiff shall comply the provision of Order XXXIX Rule 3(a) of C.P.C. Further, the plaintiff shall pay the requisite process fee and furnish sufficient copies within stipulated period. If the plaintiff fails to comply the above said order, in such circumstances, the above said exparte order stands automatically cancelled. Office is directed to issue certified copy of the exparte order only after compliance of above said order by the plaintiff. Issue notice of I.A.No.1 to the defendants along with suit summons.
02/07/2026: Sri S.S. advocate files vakalath for defendant No.2 with objection to I.A.No.1. Counsel for plaintiff files I.A. under S.151 C.P.C. for extension of interim order. Heard. Interim order extended till next date. Deficit P.F. paid. Issue suit summons, notice of I.A.No.1 and exparte T.I. order to defendant No.1. Returnable by 01.08.2026.

01/08/2026: Counsel for plaintiff files I.A. under S.151 C.P.C. for extension of interim order. Heard. Interim order extended till next date. Counsel for defendant No.2 files memo requesting the Court to direct the Plaintiff to give access to water tank which is on the terrace. P.F. paid. Issue suit summons to defendant No.1 through Court. Returnable by 18.09.2026. For say of Plaintiff to the memo. Call on 17.08.2026.
17/08/2026: Counsel for plaintiff files I.A. under S. 151 C.P.C. for extension of interim order. Heard, interim order extended till next date. Await summons of D1. Call on 09.09.2026.
09/09/2026: Counsel for Plaintiff files memo with L.C.R. issued by Police. Suit summons of defendant No.1 returned unserved as 'vacated'. Defendant No.2 present. Counsel for plaintiff appeared through V.C. and submits that a date may be fixed for cleaning overhead tank and to make repairs of leakage. In view of the said submission, 16.09.2026 is fixed to clean the tank and make repairs and Plaintiff is directed to give access for the same by opening the lock affixed to the door, till completion of the work. Call at 3.00 p.m. Case called again at 3.10 p.m. Counsel for plaintiff files I.A. under S.151 C.P.C. for extension of interim order. Heard. Interim order extended till next date. Call on hearing date i.e. 18.09.2026.
18/09/2026: Counsel for plaintiff files I.A. under S.151 C.P.C. for extension of interim order. Heard. Interim order extended till next date. Defendant No.2 files one set of Written statement with list of documents. Suit summons of returned unserved as vacated. P.F. paid. Re-issue suit summons to defendant No.1. Returnable by 05.11.2026.",
41,Principal City Civil & Sessions Court,8-CCH19 VII ,ADDL. CITY CIVIL AND SESSINS JUDGE,KABC010146182026,O.S./3709/2026,PADMA B,,URBAN STANDZ PRIVATE LIMITED,BADRINATH R,Parashuram R hattarakihal,Pending,Notice,2026-06-01,2026-11-26,"01/06/2026: Plaintiff is absent. Her learned counsel is present. In compliance, the Learned Counsel for the Plaintiff filed Memo along with the documents noted therein. Office is directed to verify as to the compliance of its objections and to report by 02.06.2026.
02/06/2026: O.S 3709/2026 Plaintiff is absent. Her learned counsel is present. Perused the office note. It is reported that the plaintiff has not produced original/certified copies of the documents except the document at seriel No.2. The learned counsel for plaintiff filed memo undertaking to produce the the original/certified copies of other documents in due course. Therefore keeping abayance office objections, heard the learned counsel for the plaintiff on I.A.No.1. The pleadings and documents on record reveals that it is the case of plaintiff that he is the tenant of the suit property and her D1 by virtue of agreement dt:18.03.2025 for a period of 3 years. Of course, the lease agreement is a unregistered document. However, it is settled position of law that even the tresspasser is entitled for injuction unless he is evicted in due process of law. Hence, as the sworn testimony the plaintiff and the documents on record at this stage reveales that she has prima facie case, balance of convinience lies in her favour and if I.A.No.1 is not considered favourably, she would suffer untold hardship, this court to proceds to fallowing order exparte. ORDER I.A.No.1 filed by the plaintiff under Order XXXIX Rules 1 and 2 of CPC is hereby allowed in part. Consequently, the defendants and the persons claiming through them hereby restrained from interferring with the peacefull posession and enjoyment of the plaintiff over the suit property till they appear and file objections to I.A.No.1. The plaintiff shall comply Order XXXIX Rule 3 of CPC within 3 days from today. In default of which, the exparte TI now granted shall stand cancelled. On compliance of order XXXIX Rule 3 of CPC by the plaintiff, office is directed to issue TI warrant, notice on I.A.No.1 and suit summons to the defendants by court and speed post if PF paid, postal covers, postal acknowledgments and sufficient numbers of copies are furnished returnable by 03.08.2026.
03/08/2026: Plaintiff is absent. His learned counsel is present. It is reported that the last date order is not complied for want of DPF. Sri.SGP advocate filed vakalath for of alleged GPA holder of D2 with the photocopy of SPA but the vakalath is not supported by the application with the original SPA. On enquiry, the counsel prayed to move the necessary application and to produce the SPA and prayed for copies. On perusal of record since the copies are available, they are furnished the learned counsel for D2. On the request of the learned counsel for plaintiff, kept by to furnish deficit PF. Again called at 3.18 pm. Both the parties are absent. The learned counsel for plaintiff is present. On his request, to furnish deficit PF, call on 04.08.2026, till then, the Interim TI is extended. call on 04.08.2026.
04/08/2026: Plaintiff is absent. His learned counsel is present. On his request, kept by to furnish deficit PF, to call at at 2.45 pm. Again called at 3.13 pm. Both the parties are absent. Their respective learned counsels are present. The learned counsel for D2 prayed time to file necessary application and to furnish original SPA. The learned counsel for plaintiff filed process memo and on his request, kept by. Again called at 4.56 pm. Both the parties are absent. The learned counsel for plaintiff is present. The learned counsel for D2 is absent. No representation. Office is directed to comply the order dated 02.06.2026 forthwith only against D1, Awaiting the process issued to D1, for D2 to file necessary application and to produce original SPA, call on 28.09.2026.
28/09/2026: Both the parties are absent. Their respective learned counsels are present. It is reported that summons to D1 by Court and Speed Post returned unserved as vacated the address and left the address respectively. The learned Counsel for D2 filed the registered original SPA along with application under order 3 Rule 2(A) read with Section 151 of CPC. It is I.A No.2. On the request of learned counsel for plaintiff, to file objections to I.A No.2 and on the request of learned counsel for D2, to file objections to I.A No.1 and W/S, call on 07.11.2026.
07/11/2026: Both the parties are absent. Their respective learned counsels are present. The learned counsel for D2 filed Written Statement in two sets along with memo adopting the same as objections to I.A.No.1 and separate objections to I.A.No.2. The learned counsel for plaintiff filed application under Order V Rule 20(1)(A) of C.P.C seeking permission to take substitute service of summons to D1 by Paper publication. It is I.A.No.3. Heard the learned counsel for D2 on I.A.No.2. On the request of the learned counsel for plaintiff, to address on I.A.No.2 and to produce the document in support of cause title address of D1 and to address on I.A.No.3 call on 26.11.2026.",
42,Principal City Civil & Sessions Court,8-CCH19 VII ,ADDL. CITY CIVIL AND SESSINS JUDGE,KABC010146222026,O.S./3708/2026,BINDU KUMARI,,URBAN STANDZ PRIVATE LIMITED,"SHARMILA K G, 
Gopi K R",Parashuram R hattarakihal,Pending,Notice,2026-06-01,2027-01-27,"01/06/2026: Plaintiff is absent. Her learned counsel is present. In compliance, the Learned Counsel for the Plaintiff filed Memo along with the documents noted therein. Office is directed to verify as to the compliance of its objections and to report by 02.06.2026.
02/06/2026: OS 3708/2026 Plaintiff is absent. Learned counsel is present. Perused the office note. It is reported that plaintiff has not produced original/certified copies at seriel No.9 to 13. The learned counsel for plaintiff filed memo along with the original of document at seriel No.10. The documents at seriel No.9 is the photocopy of FIR, 11 is electric bill, 12 is gas bill, 13 is legal notice. Therefore keeping abayance office objections, heard the learned counsel for plaintiff on I.A.No.1. The pleadings and documents on record reveals that it is the case of plaintiff that he is the tenant of the suit property and her D1 by virtue of agreement dt: 24.07.2024 for a period of 3 years. Offcourt lease copy is a unregistered copy. However it is settled position of law that even the tresspasser is entitled for injuction unless he is evicted in due process of law. Hence, as the sworn testimony the plaintiff and the documents on record at this stage reveales that she has prima facie case, balance of convinience lies in her favour and if I.A.No.1 is not considered favourably, she would suffer untold hardship, this court to proceds to fallowing order exparte. ORDER I.A.No.1 filed by the plaintiff under Order XXXIX Rules 1 and 2 of CPC is hereby allowed in part. Consequently, the defendants and the persons claiming through them hereby restrained from interferring with the peacefull posession and enjoyment of the plaintiff over the suit property till they appear and file objections to I.A.No.1. The plaintiff shall comply order XXXIX Rule 3 of CPC within 3 days from today. In default of which, the exparte TI now granted shall stand cancelled. On compliance of order XXXIX Rule 3 of CPC by the plaintiff, office is directed to issue TI warrant, notice on I.A.No.1 and suit summons to the defendants by court and speed post if PF paid, postal covers, postal acknowledgments and sufficient numbers of copies are furnished returnable by 03.08.2026.
03/08/2026: Plaintiff is absent. His learned counsel is present. It is reported that the last date order is not complied for want of DPF. On the request of the learned counsel for plaintiff, kept by to furnish the deficit PF, to call at 2.45 pm. Again called at 3.15 pm. Plaintiff is absent. His learned counsel is present. On his request, to furnish deficit PF, call on 04.08.2026, till then, the Interim TI is extended. call on 04.08.2026.
04/08/2026: Plaintiff is absent. His learned counsel is present. On his request, kept by to furnish deficit PF, to call at at 2.45 pm. Again called at 3.12 pm. Plaintiff is absent. His learned counsel is present. He filed process memo and on his request, kept by. Again called at 4.53 pm. Plaintiff is absent. His learned counsel is present. He filed application under Section 151 of C.P.C. It is I.A.No.2. Heard on I.A.No.2. Perused the record and it is found that vide order on I.A.No.1 dated 02.06.2026, the interim T.I is given the till the defendants appears and files objections to I.A.No.1. Since as of now, none of the defendants appeared and filed objections, the prayer sought in I.A.No.1 does not arise for consideration. Accordingly it is dismissed. Office is directed to comply the order dated 02.06.2026 forthwith, returnable by 28.09.2026.
28/09/2026: Plaintiff is absent. Her learned counsel is present. It is reported that summons by Court to D1 returned unserved as vacated the address; D2 and 3 not yet returned. It is also reported that summons by Speed Post to D1 returned unserved as not claimed; D2 and 3 returned unserved as left the address. On the request of the learned counsel for plaintiff, to take further steps against all the defendants, call on finally by 07.11.2026.
07/11/2026: Plaintiff and his learned counsel are absent. No representation. For plaintiff, to take further steps against all the defendants, as a last chance, call on 27.01.2027.",
43,Principal City Civil & Sessions Court,25-CCH6 XXIV,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010045902026,O.S./1168/2026,SHAKUNTALA,,URBAN STANDZ PRIVATE LIMITED,LAKSHMANA RAO R,VENKATESH B C,Pending,Evidence,2026-02-16,2026-11-21,"16/02/2026: Issue suit summons to defendant Nos.1 and 2 through Court, r/by 07.04.2026
07/04/2026: Plaintiff counsel present. Sri.VRV Advocate filed Memo of Undertaking on behalf of defendant No.1 and prays time to file vakalath and written statement. SS to defendant No.2 served, called out absent. Kept by. Case again called out at Defendant No.2 called out absent. Hence, placed exparte. Call on for vakalath and written statement and objections on behalf of defendant No.1 by 10.06.2026.
10/06/2026: Defendant No.1 and counsel absent. No representation. Kept by. Case again called out at 12.45 pm. Plaintiff counsel present. Defendant No.1 and counsel absent. No representation. Kept by. Case again called out at 3.15 pm. Defendant No.1 and counsel absent. No representation. Vakalath, written statement and objections on behalf of defendant No.1 taken as not filed. Call on for plaintiff evidence by 22.07.2026.
22/07/2026: Plaintiff Counsel present and prays time for evidence. Call on 17.08.2026.
17/08/2026: Plaintiff present and submitted to pass over the matter. Kept by. Case again called out at 1.25 pm. Plaintiff Counsel filed IA U/s. 58 r/w Sec 65 of BSA praying for marking the photo copy of Leave and License Agreement as the original is in the custody of defendant No.1. Order sheet discloses that, defendant No.2 remained exparte and though defendant No.1 appeared, not filed any written statement. Hence, subject to proof and relevancy it is necessary to permit the plaintiff to get marked the photo copy of Leave and Licence Agremenet dtd. 15.03.2024. Hence, the application is allowed. Plaintiff present and examined as Pw1. Ex.P.1 to Ex.P.10 marked. Time prayed for further chief examination of Pw1. Call on 27.08.2026.
27/08/2026: Plaintiff Counsel present and filed IA U/o 7 Rule 14 r/w sec 151 CPC along with documents. Since defendant No.2 placed exparte and defendant No.1 though appeared, did not file written statement or vakalath, objections taken as nil. Perused IA, same is heard and allowed. Documents taken on record subject to proof and relevancy. PW.1 is present and further examined in chief. Ex.P.11 to 13 marked. Since defendant No.2 placed exparte and defendant No.1 though appeared, did not file written statement or vakalath, cross examination of Pw.1 taken as nil. Plaintiff Counsel submitted no further plaintiff evidence. Defendant evidence taken as nil. Call on for arguments by 07.09.2026.
07/09/2026: Plaintiff Counsel present and submitted written arguments. Defendant and counsel absent. No representation. Copy furnished. Call on for defendant side arguments if any by 17.09.2026.
17/09/2026: Plaintiff Counsel present. Defendant and counsel absent. No representation. Since, defendant No.2 placed exparte and defendant No.1 not contest the matter, defendant side arguments taken as nil. Call on for judgment by 05.10.2026.
05/10/2026: Call on for judgment by 28.10.2026.
28/10/2026: Call on for judgment by 21.11.2026.",
44,Principal City Civil & Sessions Court,26-CCH23 XXV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010036892026,O.S./952/2026,BALAKRISHNA B G,,URBAN STANDZ PRIVATE LIMITED,,KARTHIK S R,Pending,Evidence,2026-02-06,2026-11-19,"06/02/2026: Issue summons to the defendants by 27.03.2026.
27/03/2026: As per the Report of Process Server, summons is served on office clerk of the defendant. Therefore, service is held sufficient and accordingly, the defendant is placed ex-parte. Hence, call on for plaintiffs evidence by 18.06.2026
18/06/2026: Plaintiff is absent. Sri SRK for plaintiff is present and prays time for plaintiffs evidence. Call on 02.09.2026.
02/09/2026: Plaintiff and his Counsel are present. Plaintiff present and submits his affidavit on oath in lieu of his chief examination and examined as PW-1 and deferred. For further chief of PW-1. Call on 01-10-2026
01/10/2026: Sri SRK for Plaintiff is present and prays time for further chief of PW-1. PW-1 is present Call on 19-11-2026",
45,Principal City Civil & Sessions Court,31-CCH31 XXX ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010211812026,O.S./5117/2026,KAMBADUR RAMAKRISHNA SURESH BABU,,URBAN STANDZ PRIVATE LIMITED,YASHODHA RAGHUNATHA,VIncnent P J,Pending,Summons,2026-07-16,2027-01-21,"17/07/2026: Counsel for plaintiff present and filed present suit for injunction against the defendants. Heard the arguments. For orders by 18-7-2026
18/07/2026: ORDER The defendant No 1 and 2, or their agents, henchmen, third persons or anybody claiming through them or under them, are hereby restrained, by way of temporary injunction, in any way from interfering with the peaceful possession and occupation of the suit schedule premises till next date of hearing. plaintiff shall comply the provision U/o XXXIX R 3(a) of CPC. Further, the plaintiff shall furnish copies of plaint, IA documents and required PF which shall not all deficit for issuance of summons within seven days from this date, failing which, the above order of granting of temporary injunction will automatically stands vacated. Issue suit summons, IA No. 1 notice, temporary injunction order to the defendants subject to compliance. Call on 16-09-2026.
16/09/2026: Counsel for plaintiff present and files I.A. u/Sec. 151 of CPC., for extension of I.O. Heard and perused. I.O is extended till next date of hearing. Learned counsel Sri.SKPN Advocate files vakalath for defendant No.1. For written statement and objection to IA No 1 by the defendant No 1 and reissue suit summons on I ANO 1, notice, temporary injunction order to the defendants No 2 to 5 through Court if PF paid in the office by 7/11/26.
07/11/2026: Counsel for plaintiff present and files I.A. u/Sec. 151 of CPC., for extension of I.O. Heard and perused. I.O is extended till next date of hearing. Counsel for the defendant No 1 present and filed IA No 2 U/Sec. u/Sec. 148 of CPC., seeking extension of time to file written statement. Consider the same, time granted. Reissue suit summons on IA No 1 notice temporary injunction order to the defendant No 2 to 5 through Court if PF paid in the office and for written statement and objection to IA No. 1 by the defendant No 1 by 21/1/27",
46,Principal City Civil & Sessions Court,15-CCH28 XIV,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010195242026,O.S./4788/2026,GLORY N,,URBAN STANDZ PRIVATE LIMITED,JAYARAMA B V,MALLIKARJUNA G,Pending,Summons,2026-07-04,2026-12-02,"06/07/2026: Matter called out. Counsel for the plaintiff is present and prays time to comply with the office objections by 07.07.2026.
07/07/2026: PO is on leave. Hence, case is adjourned, call on 08.07.2026.
08/07/2026: Matter called out. Proxy Counsel for the plaintiff is present and kept by. Matter called out 2nd time. Counsel for the plaintiff is present and files IA Under Section 151 of CPC with list of 2 documents that is one cheque and one lease deed in partial compliance of the office objections. Hence noting partial compliance of office objections issue SS to the defendant and E/n on IA r/by 24.08.2026.
24/08/2026: Matter called out. Counsel for the plaintiff is present. If required DPF is furnished within 7 days hence reissue summons to the defendant No.1 and 2 by 15.10.2026.
15/10/2026: Matter called out. Proxy counsel for the plaintiff is present. Plaintiff to take necessary steps. If required DPF is furnished. Re-issue SS to defendant no.1 and 2 r/by 02.12.2026.",
47,Principal City Civil & Sessions Court,32-CCH14 XXXI,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010184212026,O.S./4582/2026,HIRISHA V,,URBAN STANDZ PRIVATE LIMITED,SOUMYASHREE,KALYAN BASAVARAJ S,Pending,Summons,2026-06-29,2026-11-17,"30/06/2026: Heard on I.A.No.1. For orders by 01.07.2026
01/07/2026: Ex-parte Temporary Injunction, as sought in I.A. No.I, is granted till the next date of hearing. Issue ex-parte Temporary Injunction order, suit summons and notice on I.A. No.I to the defendants, subject to compliance with Order XXXIX Rule 3(a) of CPC and after confirming that required process fee is paid. Returnable by 30.07.2026.red process fee is paid.
30/07/2026: Existing T.I is extended till next date of hearing. For defendant Sri.RR Advocate filed the vakalath and prays time to file the written statement and objection to I.A.No.1. Call on 27.08.2026.
27/08/2026: Existing T.I is extended till next date of hearing. For written statement of defendant No.1 and to take steps against defendant by 19.09.2026.
19/09/2026: Existing T.I is extended till next date of hearing. For taking steps against defendant No.2 prays time by 15.10.2026.
15/10/2026: Existing T.I is extended till next date of hearing. The plaintiff and plaintiff counsel absent. No representation. For steps against defendant No.2 finally by 17.11.2026.",
48,Principal City Civil & Sessions Court,32-CCH14 XXXI,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010181962026,O.S./4520/2026,RAEESUL ASAD C P,,URBAN STANDZ PRIVATE LIMITED,UMA MAHESHWARI BHASKAR,KALYAN BASAVARAJ S,Pending,Summons,2026-06-27,2026-12-07,"27/06/2026: Heard on I.A.No.1. For orders on I.A.No.1 by 29.06.2026.
29/06/2026: Ex-parte Temporary Injunction, as sought in I.A.No.1, is granted till next date of hearing. Issue ex-parte Temporary Injunction order, suit summons and notice on I.A.No.1 to the defendant, subject to compliance with Order XXXIX Rule 3(a) of CPC and after confirming that required process fee is paid. Returnable by 11.08.2026.
11/08/2026: Existing T.I is extended till next date of hearing. For defendant Smt.AN Advocate filed the vakalath. For objection to I.A.No.1 and written statement by 09.09.2026.
09/09/2026: Existing T.I is extended till next date of hearing. The defendant and defendant counsel absent. For objection and written statement by 09.10.2026.
09/10/2026: Existing TI extended till next date of hearing. Defendant No.1 counsel prays time to file the WS and for objection to IA No.1. Issue summons and notice of IA No.1 to the D-2, PF already paid. Call on 07/12/2026.",
49,Principal City Civil & Sessions Court,4-CCH25 III ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010149002026,O.S./3801/2026,SUFFIYA KHAN,,URBAN STANDZ PRIVATE LIMITED,AMY ETHEL EDWARD,rabhakar.s,Pending,Summons,2026-06-02,2026-11-18,"03/06/2026: Learned counsel for plaintiff present and files memo along with copy of payment of rent through UPI. Heard on IA.No. 1. For orders by 04.06.2026.
04/06/2026: Issue Suit Summons, Emergent Notice on IA.No.1 to the defendants, by 13.07.2026.
13/07/2026: PO is on Training. Call on 10.8.2026.
10/08/2026: Learned counsel for plaintiff present and files memo along with receipt showing that the amount paid to the owner to wards the maintenance. Re issue emergent notice on IA.No.1 and suit summons to defendants, if PF paid and correct address furnished, r/by 10.09.2026.
10/09/2026: Learned counsel for plaintiff absent. No representation. Re issue emergent notice on IA.No.1 and suit summons to defendants, if PF paid and correct address furnished, r/by 18.11.2026.",
50,Principal City Civil & Sessions Court,20-CCH18 XIX,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010145472026,O.S./3659/2026,PRAJWAL V S,,URBAN STANDZ PRIVATE LIMITED,SHANTHAMMA H,CHANDRA SHEKAR L,Pending,Summons,2026-05-30,2026-12-11,"30/05/2026: Case called out. Learned Counsel for the Plaintiff present. Heard on IA.No.I. The present suit is filed by plaintiff for relief of Permanent Injunction and such other reliefs. Considering the urgency made out by the plaintiff, IA.No.I filed by plaintiff u/s 11(3) of Bangalore City Civil Court Act is allowed. Plaintiff is permitted to file the suit before the vacation court. Heard the learned counsel for plaintiff on IA.No.2. Call later for orders on IA.No. 2. Orders on IA.No.2 The plaintiff has filed this suit against defendant for the relief of permanent injunction and such other reliefs. In the suit IA.No.2 is filed under Order 39 Rule 1 and 2 of CPC for interim injunction to restrain the defendants from evicting him from the suit schedule property in support of the application affidavit and plaintiff is filed wherein the plaint averments have been repeated. The plaintiff claims that he is the sub lessee of the suit schedule property but no document have been produced to show that there is lease agreement between the original owner and defendant No.2 and 3. Apart from the no lease agreement between the plaintiff and original lessee is produced. The NOC produced by the plaintiff is not sufficient to consider the IA.No.2. Apart from that there is document to show the duration of sub lease, hence following order is passed. ORDER Issue emergent notice of IA.No.2 and suit summons to the defendants if PF is paid. Rt/by 20.06.2026.
20/06/2026: Counsel for plaintiff present. Suit summons to defendant No.2 and 3 returned unserved as not found and left and vacated and defendant No.1 not received from C.P.N. Branch. Await court summons from C.P.N. and steps against defendant No.2 and 3 with correct address by 01.08.2026.
01/08/2026: Suit summons of defendant No.2 and 3 not returned. Await suit summons of defendant No.1 and steps against defendant No.2 and 3 with correct address by 09.10.2026.
09/10/2026: PF and postal covers furnished. Issue SS to defendant No.1 to 3 through court and speed post. R/by 11.12.2026.",
51,Principal City Civil & Sessions Court,7-CCH11 VI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC010229202026,O.S./5520/2026,MARIAMMA JOPSEPH,,MUNIRAJ M & URBAN STANDZ PRIVATE LIMITED,,Varadaraju L,Pending,Orders,2026-07-29,2026-12-09,"29/07/2026: Case is called out. Learned Counsel for plaintiff filed memo with original lease agreement. Office is hereby directed to keep original document in safe custody. Heard the arguments of Learned Counsel for plaintiff on IA No.1. For orders. Call on: 03-08-2026
03/08/2026: O R D E R Pending hearing and final disposal of I.A. No. 1, an ad interim exparte temporary injunction is hereby granted restraining defendant No. 1, his family members, agents, servants, henchmen or any person claiming through or under him from forcibly evicting the plaintiff from the suit schedule property,breaking open the locks or otherwise interfering with the plaintiff's peaceful possession and enjoyment of the suit schedule property; and disrupting the essential utility services provided to the suit schedule property till the next date of hearing. The plaintiff shall comply with the provisions of Order XXXIX Rule 3 of the Code of Civil Procedure. Issue exparte temporary injunction, notice of I.A.No.1 and suit summons to the defendants by speed post and Court process if process fee paid and postal covers furnished. call on 09-12-2026",
52,Mayo Hall - CCH21,27-CCH 20-XXVI ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0032572026,O.S.	25966/2026,RAGHU RAMAN A R,AJEETHA,URBAN STANDZ PRIVATE LIMITED,"R SINDHU, LAKSHMI R ",Suresh V,Pending,SUMMONS,2026-09-07,2026-11-20,"07/09/2026: O.S. 25966/2026 Learned counsel for Plaintiff present. To hear Call on 09.09.2026.
09/09/2026: O.S. 25966/2026 Learned counsel for Plaintiff present. Heard Learned counsel for Plaintiff on I.A no.1 For orders Call on 10.09.2026.
10/09/2026: O r d e r Plaintiffs have filed this suit seeking for mandatory injunction directing the defendants to quit the suit schedule property and hand over vacant possession of the same to plaintiffs and also direct the defendants to pay Rs.2,43,000/- towards arrears of rent and Rs.2,00,000/- as damages and such other reliefs. Now, they also moved IA No.1 U/o 39 Rule 10 of CPC seeking for Ex-parte/ Ad-interim order against defendants directing them to pay Rs.2,43,000/- towards arrears of rent and to deposit monthly rent of Rs.40,500/-. Perused the records, on considering the facts and circumstances of the case, it is just and proper to hear the defendants before considering I.A. No.1 on merits. Hence, issue emergent suit summons and notices on I.A.No.1 to defendants through court as well as Speed Post. Call on 29.09.2026.
29/09/2026: O.S. 25966/2026 Learned counsel for Plaintiff present. Sri. HM Advocate filed vakalath for Defendant no.2. Defendant no.3 is reported as dead by process server. Learned counsel for Plaintiff prays time to take steps to Lrs of Defendant no.3 and fresh steps to Defendant no.1. For Written Statement of Defendant no.2 and steps to Lrs of Defendant no.3 and fresh steps to Defendant no.1. Call on 29.10.2026.
29/10/2026: O.S. 25966/2026 Learned counsel for Plaintiff filed I.A no.2 u/o 22 R 4 of CPC, seeking permission to bring the proposed Lrs of Defendant no.3. Learned counsel for Plaintiff prays time to file other necessary applications. Learned counsel for Defendant no.2 present and filed application u/sec 148 of CPC, seeking time to file Written Statement of Defendant no.2. Heard, Perused the records On considering facts and circumstance application is allowed. Reissue SS to Defendant no.1 through speed post as well as court, if PF and charges are paid in office with in 7 days. Call on 20.11.2026.",
53,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0022012026,O.S./25674/2026,Suresh,,Urban Standz Pvt. Ltd. & Raghavendra E,,C.V. Siju,Pending,Summons,2026-07-06,2026-11-30,"06/07/2026: O.S. 25674/2026 The Ld. advocate for the plaintiff is present. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 07-07-2026.
07/07/2026: O.S. 25674/2026 Issue SS, notice of I.A.No. I and order of temporary injunction to the defendant after compliance. Call on 18-08-2026.
18/08/2026: O.S. 25674/2026 Sri. SY advocate has filed vakalath for defendant No.2 and prays time to file W/Stt and objections to I.A.No. I. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till next date. Await SS of defendant No.1 and W/Stt of defendant No.2 and objections to I.A.No. I. Call on 17-09-2026.
17/09/2026: O.S. 25674/2026 W/Stt of defendant No.2 in two sets is filed. The Ld. advocate for the defendant No.2 has filed a memo adopting the objections as I.A.No. I. The Ld. advocate for the plaintiff has filed a memo with one document. The Ld. advocate for the Plaintiff has also filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. Reissue SS to defendant No.1 through speed post. Call on 29-10-2026.
29/10/2026: O.S. 25674/2026 The Ld. advocate for the plaintiff is present. The Ld. advocate for the defendant No.2 urges to hear I.A.No. I. Steps taken, PF paid and RPAD cover furnished. Reissue SS to defendant No.1 through speed post. For hearing on I.A.No. I. Call on 30-11-2026.",
54,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0016812026,O.S./25566/2026,Manjula B,,Urban Standz Pvt. Ltd.,Anna Nanda Kumar,G T Yathisha,Pending,Written Statement,2026-06-09,2026-11-30,"09/06/2026: O.S./25566/2026 The Ld. advocate for the plaintiff is present and prays time for hearing on I.A.No. I and II. For hearing on I.A.No. I and II. Call on 11-06-2026.
11/06/2026: O.S. 25566/2026 The Ld. advocate for the plaintiff is present and has filed a memo with two documents. Heard the arguments on I.A.No. I on behalf of plaintiff. Posted for orders. Call on 12-06-2026.
12/06/2026: Issue suit summons, notice of IA No. I and order of temporary injunction to the defendants after compliance.
14/07/2026: O.S. 25566/2026 The Ld. advocate for the plaintiff has filed IA U.sec 151 of CPC for extension of interim order. Interim order extended till further orders. Sri GS advocate has filed advocate for defendant No 2 and prays time to file written statement. Await summons of defendant No 1 and for written statement of defendant No 2 Call on 14.08.2026.
14/08/2026: O.S. 25566/2026 The advocate for defendant No 2 has filed an application U.sec 148 of CPC for extension of time to file written statement. Same is hereby allowed. For written statement of defendant No 2 and await summons of defendant No 9 by 05.09.2026
05/09/2026: Regular PO is on leave. Case adjourned.
22/09/2026: O.S. 25566/2026 The Ld. advocate for the defendant No.2 has filed W/Stt of defendant No.2 in two sets along with objections to I.A.No. I. Reissue SS to defendant No.1 through speed post. Call on 27-10-2026.
27/10/2026: PF paid Reissue SS to Defendant No 1 through speed post",
55,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0023062026,O.S./25694/2026,Vijaya Kumari R,,Venkata Swamy Narayanan & Urban Standz Pvt. Ltd.,,Kamalanathan P,Pending,Summons,2026-07-09,2026-11-25,"09/07/2026: O.S. 25694/2026 The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 11.06.2025 and request to keep the said document in safe custody. Heard, the arguments of the counsel for the plaintiff on I.A.No. I. Office is hereby directed to keep the original document in safe custody. Posted for orders. Call on 10-07-2026.
10/07/2026: Issue suit summons, notice of IA No. I and order of temporary injunction to the defendants after compliance.
17/08/2026: O.S. 25694/2026 Sri. RPR advocate has filed vakalath on behalf of defendant No.1 and prays time to file W/Stt and objections to I.A.No. I. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till next date. For W/Stt of defendant No.1 and objections to I.A.No. I and also for steps to defendant No.2. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25694/2026 Both parties and their counsels are absent. No representation. Finally, for steps. Call on 25-11-2026.",
56,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020062026,O.S./25642/2026,Divya K,,Venkata Swamy Narayanan & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25642/2026 Defendant No.1 is present. Plaintiff and his counsel are absent. For steps. Call on 25-11-2026.",
57,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020052026,O.S./25641/2026,Anantharaj T L,,Prabhavathi Narayana & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has practical reasons files memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25641/2026 Both parties and their counsels are absent. No representation. Finally, for steps. Call on 25-11-2026.",
58,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020042026,O.S./25640/2026,Shakuntala C; Anitha J,,Venkata Swamy Narayanan & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25640/2026 Defendant No.1 is present. Plaintiff and his counsel are absent. For steps. Call on 25-11-2026.",
59,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020032026,O.S./25639/2026,Hitesh Jain,,Venkata Swamy Narayana & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25639/2026 Defendant No.1 is present. Plaintiff and his counsel are absent. For steps. Call on 25-11-2026.",
60,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020022026,O.S./25638/2026,S K Gopinath,,Prabhavathi Narayana & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25638/2026 Both parties and their counsels are absent. No representation. For steps. Call on 25-11-2026.",
61,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020012026,O.S./25637/2026,Thilak J; Ramya Murthy N,,Venkata Swamy Narayanan & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25637/2026 Defendant No.1 is present. Plaintiff and his counsel are absent. For steps. Call on 25-11-2026.",
62,Mayo Hall - CCH21,5-CCH 21-IV ,ADDL. CITY CIVIL AND SESSIONS JUDGE,KABC0A0020002026,O.S./25636/2026,Ambika Arvind,,Prabhavathi Narayana & Urban Standz Pvt. Ltd.,,Kamalanathan,Pending,Written Statement,2026-06-25,2026-11-25,"25/06/2026: The Ld. advocate for the plaintiff has filed a memo with original lease agreement dtd. 06-05-2025 and requests to keep the original lease agreement in safe custody. Heard, the arguments of counsel for plaintiff on I.A.No. I. Posted for orders. Call on 27-06-2026.
27/06/2026: Issue SS, notice of I.A.No. I and order of temporary injunction to the defendants after compliance. Office is hereby directed to keep the original lease agreement dtd. 08.05.2025 furnished with the memo dtd. 25.06.2026 in safe custody. Call on 31-07-2026.
31/07/2026: Sri. RPR advocate has filed vakalath on behalf of defendant and prays time to file W/Stt. The Ld. advocate for the Plaintiff is present and has filed application U/sec. 151 of CPC for extension of IO. Same is hereby allowed. IO is extended till further orders. For W/Stt of defendant. Call on 31-08-2026.
31/08/2026: The Ld. advocate for the defendant has filed I.A.U/sec. 148 of CPC for extension of time to file W/Stt. Same is hereby allowed. For W/Stt of defendant. Call on 30-09-2026.
30/09/2026: Both the counsels are present. The Ld. advocate for the defendant No.1 has filed W/Stt of defendant No.1 in two sets along with a list of 5 documents. Reissue SS to defendant No.2 through speed post. Call on 03-11-2026.
03/11/2026: O.S. 25636/2026 Both parties and their counsels are absent. No representation. For steps. Call on 25-11-2026."
"""

reader = csv.DictReader(io.StringIO(csv_content.strip()))
records = []

def clean_val(v):
    return (v or "").strip()

for r in reader:
    serial = int(clean_val(r["Master Serial"]))
    court = clean_val(r["Court"])
    cch = clean_val(r["CCH"])
    judge = clean_val(r["Judge"])
    cnr = clean_val(r["CNR"])
    reg_no = clean_val(r["Registration No."]).replace("\t", " ")
    
    # Process plaintiffs
    p1 = clean_val(r["Plaintiff-1"])
    p2 = clean_val(r.get("Plaintiff-2"))
    p3 = ""
    
    if ";" in p1:
        parts = [x.strip() for x in p1.split(";")]
        p1 = parts[0]
        if len(parts) > 1 and not p2:
            p2 = parts[1]
        elif len(parts) > 1:
            p3 = parts[1]
    
    if "\n" in p2 or "," in p2:
        parts = [x.strip() for x in re.split(r"[\n,]+", p2) if x.strip()]
        if len(parts) > 1:
            p2 = parts[0]
            p3 = parts[1]
        elif len(parts) == 1:
            p2 = parts[0]
            
    # Process defendants
    d1 = clean_val(r["Defendant-1"])
    d2 = clean_val(r.get("Defendant-2"))
    d3 = ""
    d4 = ""
    
    if "&" in d1:
        parts = [x.strip() for x in d1.split("&")]
        d1 = parts[0]
        if len(parts) > 1 and parts[1]:
            extra_d = [x.strip() for x in re.split(r"[,]+", parts[1]) if x.strip()]
            if not d2 and len(extra_d) > 0:
                d2 = extra_d[0]
                if len(extra_d) > 1:
                    d3 = extra_d[1]
            elif d2 and len(extra_d) > 0:
                if not d3:
                    d3 = extra_d[0]
                if len(extra_d) > 1 and not d4:
                    d4 = extra_d[1]

    if "\n" in d2 or "," in d2 or " and " in d2.lower():
        parts = [x.strip() for x in re.split(r"[\n,]+|\band\b", d2, flags=re.IGNORECASE) if x.strip()]
        if len(parts) == 2:
            d2 = parts[0]
            if not d3:
                d3 = parts[1]
        elif len(parts) >= 3:
            d2 = parts[0]
            if not d3:
                d3 = parts[1]
            if not d4:
                d4 = parts[2]

    advocate = clean_val(r["Advocate"])
    status = clean_val(r["Status"]) or "Pending"
    stage = clean_val(r["Stage"])
    filing_date = clean_val(r["Filing Date"])
    next_hearing = clean_val(r["Next Hearing"])
    last_business = clean_val(r["Last Business"])
    linked_case = clean_val(r.get("Linked Case"))

    cat = "Tenant vs Landlord & Urban Standz"
    if serial in [17, 34, 35, 36, 52]:
        cat = "Landlord vs Tenant & Urban Standz"
    elif "C.C." in reg_no or "P.C.R." in reg_no:
        cat = "Criminal / Cheating / 138 NI Act"

    record = {
        "id": f"case-{serial}",
        "serialNumber": serial,
        "court": court,
        "cch": cch,
        "judge": judge,
        "cnr": cnr,
        "registrationNumber": reg_no,
        "plaintiff1": p1,
        "plaintiff2": p2,
        "plaintiff3": p3,
        "defendant1": d1,
        "defendant2": d2,
        "defendant3": d3,
        "defendant4": d4,
        "advocate": advocate,
        "status": status,
        "stage": stage,
        "filingDate": filing_date,
        "nextHearing": next_hearing,
        "lastBusiness": last_business,
        "linkedCase": linked_case,
        "category": cat,
        "updatedAt": "2026-11-14T09:30:00.000Z"
    }
    records.append(record)

# Disposed cases
d_rows = [
    {
        "id": "case-disp-1",
        "serialNumber": 63,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1033-XXI",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "",
        "registrationNumber": "P.C.R./6678/2026",
        "plaintiff1": "MURALIDHARA KARANAM",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "SHYAM PRASAD T S",
        "status": "Disposed",
        "stage": "Converted to CC",
        "filingDate": "",
        "nextHearing": "",
        "lastBusiness": "Converted to C.C./51095/2026",
        "linkedCase": "C.C./51095/2026",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-2",
        "serialNumber": 64,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1033-XXI",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "",
        "registrationNumber": "P.C.R./4269/2026",
        "plaintiff1": "RUHINA FIRDOSE",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "RAJESH M D",
        "status": "Disposed",
        "stage": "Converted to CC",
        "filingDate": "",
        "nextHearing": "",
        "lastBusiness": "Converted to C.C./35659/2026",
        "linkedCase": "C.C./35659/2026",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-3",
        "serialNumber": 65,
        "court": "Principal City Civil & Sessions Court",
        "cch": "",
        "judge": "ADDL. CITY CIVIL AND SESSIONS JUDGE",
        "cnr": "",
        "registrationNumber": "O.S./3715/2026",
        "plaintiff1": "MANJULA B",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "URBAN STANDZ PRIVATE LIMITED",
        "defendant2": "ANNA NANDA KUMAR",
        "defendant3": "",
        "defendant4": "",
        "advocate": "VISHWANATH N",
        "status": "Disposed",
        "stage": "Disposed",
        "filingDate": "",
        "nextHearing": "",
        "lastBusiness": "Matter disposed.",
        "linkedCase": "O.S./25566/2026",
        "category": "Tenant vs Landlord & Urban Standz",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-4",
        "serialNumber": 66,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1032-XXII",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "KABC030686372026",
        "registrationNumber": "P.C.R./7299/2026",
        "plaintiff1": "Suresh",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "C V SIJU",
        "status": "Disposed",
        "stage": "SWORN STATEMENT",
        "filingDate": "",
        "nextHearing": "2026-08-07",
        "lastBusiness": "07/08/2026: for s/statement\n20/08/2026: Office is directed to register a Criminal case against the accused in register no.3. Issue summons to the accused.",
        "linkedCase": "C.C./57175/2026",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-5",
        "serialNumber": 67,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1032-XXII",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "KABC030680282026",
        "registrationNumber": "P.C.R./7232/2026",
        "plaintiff1": "Suresh",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "C V SIJU",
        "status": "Disposed",
        "stage": "SWORN STATEMENT",
        "filingDate": "",
        "nextHearing": "2026-08-06",
        "lastBusiness": "06/08/2026: FOR S/STATEMENT\n20/08/2026: Office is directed to register a Criminal case against the accused in register no.3. Issue summons to the accused.",
        "linkedCase": "C.C./57160/2026",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-6",
        "serialNumber": 68,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1031-XIX",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "KABC030681052026",
        "registrationNumber": "P.C.R./7238/2026",
        "plaintiff1": "GURUDATH G",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "RAMKUMAR P K",
        "status": "Disposed",
        "stage": "Disposed",
        "filingDate": "",
        "nextHearing": "2026-08-06",
        "lastBusiness": "02/09/2026: P.O. is on leave, hence the case is adjourned to\n26/09/2026: CONVERTED TO CC",
        "linkedCase": "C.C./64822/2026",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    },
    {
        "id": "case-disp-7",
        "serialNumber": 69,
        "court": "Chief Judicial Magistrate, Bengaluru City",
        "cch": "1033-XXI",
        "judge": "ADDL CHIEF JUDICIAL MAGISTRATE",
        "cnr": "KABC030652662026",
        "registrationNumber": "P.C.R./7027/2026",
        "plaintiff1": "NITHIN KUMAR V",
        "plaintiff2": "",
        "plaintiff3": "",
        "defendant1": "M/S URABN STANDZ PRIVATE LTD",
        "defendant2": "",
        "defendant3": "",
        "defendant4": "",
        "advocate": "ANAND R B",
        "status": "Disposed",
        "stage": "Disposed",
        "filingDate": "",
        "nextHearing": "2026-07-30",
        "lastBusiness": "27/08/2026: For sworn statement\n23/09/2026: Converted",
        "linkedCase": "",
        "category": "Criminal / Cheating / 138 NI Act",
        "updatedAt": "2026-11-14T09:30:00.000Z"
    }
]

records.extend(d_rows)

with open("src/data/initialCases.json", "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print(f"Generated src/data/initialCases.json with {len(records)} records!")
