## 即时流程

delta|p1|p2|p3|...|pn
------------ | ------------- | ------------
-|enter|enter|enter|enter|enter
-|ready|ready|ready|ready|-
-|-|-|-|-|last ready*
5s|-|-|-|-|start(or auto)
~short|random chosen|-|-|-|-
short|word & board|dis-board|dis-board|dis-board|dis-board
long|draw|guess|guess|guess|guess
~short|show result|show answer|show answer|show answer|show answer
short|new turn(auto)|-|-|-|-
~short|-|random chosen|-|-|-
~||repeat|||
short|new turn(auto)|-|-|-|-
~short|-|-|random chosen|-|-
~|||repeat||
short|new turn(auto)|-|-|-|-
~short|-|-|-|random chosen|-
~||||repeat|
short|new turn(auto)|-|-|-|-
~short|-|-|-|-|random chosen
~|||||repeat
short|game over(auto)|-|-|-|-
-|final result|final result|final result|final result|final result
-|ready|ready|ready|ready|ready
-|repeat|-|-|-|-

last ready*: 人数满足条件才能开始
