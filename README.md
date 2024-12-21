**Prototype**
How start:

- 1 session will contain more exercies:
- How is 1 session started
- 1 session include more exercies
- 1 exercies include more sets
- 1 set include more reps and time to rest
- 1 session have date

Flow of session:

- User open app and choose program
- User start program (will tracking time and getTime() in this point)
- App will refer exercise and show rep and set of exercise
- When user done each exercise rest time will be interval
- Drawer will show up to user fill set and rep in this

Data:

_Data Type_

- Goal of set x rep (will be init) will be calculate when users create programs
- Current of set x rep (present work out)
- Past of set x rep (lasted work out)

_Color_

- If Current => Goal -> Green
- If Current => Past && Current < Goal -> Yellow
- If Current < Past && Current < Goal - > Red

- Init set x rep
- When finish exercise will give input of set x rep

_WorkFlow_

- Add template name
- Show calendar default by now
-

- First when init create session for create page
-

create in session store
2 type of session

- session today
- session another day

- session today will be init when user start session
- session another day will be init when user open session page
