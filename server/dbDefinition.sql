BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"		INTEGER,
	"name"		TEXT NOT NULL,
	"email"		TEXT UNIQUE NOT NULL,
	"password"	TEXT NOT NULL,
	"salt"		TEXT NOT NULL,
	"role"		TEXT NOT NULL DEFAULT('user'),
	PRIMARY KEY("id" AUTOINCREMENT),
	CHECK ("role" IN ('user','admin'))
);

CREATE TABLE IF NOT EXISTS "tickets" (
	"id"		INTEGER,
	"title"		TEXT NOT NULL,
	"category"	TEXT NOT NULL,
	"description"	TEXT NOT NULL,
	"state"		TEXT NOT NULL DEFAULT('open'),
	"timestamp"	TEXT NOT NULL,
	'owner'		INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("owner") REFERENCES users(id),
	CHECK ("state" IN ('open','closed')),
	CHECK ("category" IN ('inquiry','maintenance','new feature','administrative','payment'))
);

CREATE TABLE IF NOT EXISTS "textblocks" (
	"id"		INTEGER,
	"text"		TEXT NOT NULL,
	"timestamp"	TEXT NOT NULL,
	"author"	INTEGER NOT NULL,
	"ticket"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("author") REFERENCES users(id),
	FOREIGN KEY("ticket") REFERENCES tickets(id)
);


INSERT INTO "users" ("name","email","password","salt","role") VALUES ('Francesco', 'francesco@test.com','1afa9f921146638fe00f8fabf44f580ff22a58bc8b1714380488b6c1d6b6eb01','4vGdcJHL06Tt43hj','admin');

INSERT INTO "users" ("name","email","password","salt","role") VALUES ('Enrico', 'enrico@test.com','718ea023226f85ea52e401253c6eb730baee4193c694f1f16978be7a9cd19cd1','DgAer43GhsEklJr5','admin');

INSERT INTO "users" ("name","email","password","salt","role") VALUES ('Marika', 'marika@test.com','1e9bf58e38c07a115dca56918721fe8b681f9af9ca33b5a973bcbaeeacb08883','9tJYwiY44JjgUL0i','user');

INSERT INTO "users" ("name","email","password","salt") VALUES ('John', 'john@test.com','d30cd75f7fbfcd7d8e0d89bcafcd27109e5672b18c4689a7972450d21a6221fd','7tTPDkSWXLN8u6P3');

INSERT INTO "users" ("name","email","password","salt") VALUES ('Rick', 'rick@test.com','cf889f9c6ae2ae9cd76652d4d80bfe8c46984b0f6b6ebeb9e84972824dea9895','2Dubn1I2HsCYLvSE');


INSERT INTO "tickets" ("title","category","description","state","timestamp","owner") VALUES ('Problem with payment', 'payment','I payed for the product but I did not receive the confirmation email', 'open','09-06-2024 14:23:45', '4'); 
INSERT INTO "tickets" ("title","category","description","state","timestamp","owner") VALUES ('Are the servers down for maintenance', 'inquiry','I am not able to login so I was wandering if the servers are down', 'closed','03-04-2024 12:15:05', '4'); 

INSERT INTO "tickets" ("title","category","description","state","timestamp","owner") VALUES ('Update 15.03', 'new feature','A new feature has been added to predict the time it will take to close a ticket', 'open','04-02-2023 09:30:12', '1'); 
INSERT INTO "tickets" ("title","category","description","state","timestamp","owner") VALUES ('Maintenence 25-05-2024', 'maintenance','On 25-05-2024 there will be a server maintenence from 12:00 that will last 3 hours', 'closed','20-05-2024 10:00:05', '1'); 

INSERT INTO "tickets" ("title","category","description","timestamp","owner") VALUES ('Application for admin role', 'administrative','When will applications be open?', '09-06-2024 15:12:48', '5'); 
INSERT INTO "tickets" ("title","category","description","state","timestamp","owner") VALUES ('Card payment problem', 'payment','At payment time my card gets rejected even though It is not expired and is a valid card', 'closed','11-01-2024 11:12:21', '5'); 

INSERT INTO "textblocks" ("author","ticket","text","timestamp") VALUES ('2','1','Sometimes emails can take up to few hours to be delivered.
Keep us updated if you still do not receive any email.','09-06-2024 15:05:32');
INSERT INTO "textblocks" ("author","ticket","text","timestamp") VALUES ('4','1','Two hours have passed but I did not receive any email yet','09-06-2024 16:30:12');

INSERT INTO "textblocks" ("author","ticket","text","timestamp") VALUES ('2','6','Today we were notified of some issues with the banking circuits for card payments.
We are sorry for the issue but unfortunately it is beyond our control','11-01-2024 12:00:12');

INSERT INTO "textblocks" ("author","ticket","text","timestamp") VALUES ('5','6','I see. I will tag this ticket as closed and wait until the problem is fixed.','11-01-2024 12:10:52');

COMMIT;
