
import * as mongoDB from 'mongodb';
import { connect } from '../mongo/mongo';

export async function insertQuestionsInCatalog() {
    try {
        const db: mongoDB.Db = await connect();
        const questionInCatalogCollection = db.collection('questionInCatalog');
        
        // Insert documents
        const results = [];

        const result3 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f799d93fb13cd308e818"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f42fd93fb13cd308e809"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f809d93fb13cd308e81a"),
            transition: "incorrect"
        },
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f846d93fb13cd308e81b"),
            transition: "correct"
        }
    ]
});
        console.log(`Document inserted with id: ${result3.insertedId}`);
        results.push(result3);

        const result4 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f809d93fb13cd308e81a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f530d93fb13cd308e80b"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fb82d93fb13cd308e839"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result4.insertedId}`);
        results.push(result4);

        const result5 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f846d93fb13cd308e81b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f486d93fb13cd308e80a"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f866d93fb13cd308e81c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f89ad93fb13cd308e81d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result5.insertedId}`);
        results.push(result5);

        const result6 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f866d93fb13cd308e81c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f553d93fb13cd308e80c"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f8bdd93fb13cd308e81e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f8d2d93fb13cd308e81f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result6.insertedId}`);
        results.push(result6);

        const result7 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f89ad93fb13cd308e81d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f530d93fb13cd308e80b"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1222031781a97964c3b1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result7.insertedId}`);
        results.push(result7);

        const result8 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f8bdd93fb13cd308e81e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f8efd93fb13cd308e821"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f8fbd93fb13cd308e822"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result8.insertedId}`);
        results.push(result8);

        const result9 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f8d2d93fb13cd308e81f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f575d93fb13cd308e80d"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f8dfd93fb13cd308e820"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result9.insertedId}`);
        results.push(result9);

        const result10 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f8dfd93fb13cd308e820"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fd2fd93fb13cd308e856"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fd42d93fb13cd308e857"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result10.insertedId}`);
        results.push(result10);

        const result11 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f8efd93fb13cd308e821"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f914d93fb13cd308e824"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result11.insertedId}`);
        results.push(result11);

        const result12 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f8fbd93fb13cd308e822"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f907d93fb13cd308e823"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result12.insertedId}`);
        results.push(result12);

        const result13 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f907d93fb13cd308e823"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe193c031781a97964c46a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result13.insertedId}`);
        results.push(result13);

        const result14 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f914d93fb13cd308e824"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f91bd93fb13cd308e825"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result14.insertedId}`);
        results.push(result14);

        const result15 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f91bd93fb13cd308e825"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f943d93fb13cd308e826"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f968d93fb13cd308e827"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result15.insertedId}`);
        results.push(result15);

        const result16 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f943d93fb13cd308e826"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7f9bdd93fb13cd308e829"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7f9c9d93fb13cd308e82a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result16.insertedId}`);
        results.push(result16);

        const result17 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f968d93fb13cd308e827"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f987d93fb13cd308e828"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result17.insertedId}`);
        results.push(result17);

        const result18 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f987d93fb13cd308e828"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe0fef031781a97964c39f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe0ffb031781a97964c3a0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result18.insertedId}`);
        results.push(result18);

        const result19 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f9bdd93fb13cd308e829"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fa3ad93fb13cd308e82c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fa47d93fb13cd308e82d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result19.insertedId}`);
        results.push(result19);

        const result20 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f9c9d93fb13cd308e82a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7f9d5d93fb13cd308e82b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result20.insertedId}`);
        results.push(result20);

        const result21 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f9d5d93fb13cd308e82b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbcfe9d1f17f7ead8e7621"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbcfedd1f17f7ead8e7622"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result21.insertedId}`);
        results.push(result21);

        const result22 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa3ad93fb13cd308e82c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fa86d93fb13cd308e82f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fa9bd93fb13cd308e830"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result22.insertedId}`);
        results.push(result22);

        const result23 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa47d93fb13cd308e82d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fa53d93fb13cd308e82e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result23.insertedId}`);
        results.push(result23);

        const result24 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa53d93fb13cd308e82e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1a92031781a97964c4a5"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a95031781a97964c4a6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result24.insertedId}`);
        results.push(result24);

        const result25 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa86d93fb13cd308e82f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7faf5d93fb13cd308e832"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result25.insertedId}`);
        results.push(result25);

        const result26 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa9bd93fb13cd308e830"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fa9fd93fb13cd308e831"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result26.insertedId}`);
        results.push(result26);

        const result27 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fa9fd93fb13cd308e831"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1ac2031781a97964c4ac"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result27.insertedId}`);
        results.push(result27);

        const result28 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7faf5d93fb13cd308e832"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7faffd93fb13cd308e833"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result28.insertedId}`);
        results.push(result28);

        const result29 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7faffd93fb13cd308e833"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result29.insertedId}`);
        results.push(result29);

        const result30 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fb82d93fb13cd308e839"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f553d93fb13cd308e80c"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fb8ed93fb13cd308e83a"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fb99d93fb13cd308e83b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result30.insertedId}`);
        results.push(result30);

        const result31 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fb8ed93fb13cd308e83a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fec9d93fb13cd308e872"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fed5d93fb13cd308e873"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result31.insertedId}`);
        results.push(result31);

        const result32 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fb99d93fb13cd308e83b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f575d93fb13cd308e80d"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fba8d93fb13cd308e83c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result32.insertedId}`);
        results.push(result32);

        const result33 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fba8d93fb13cd308e83c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fbb6d93fb13cd308e83d"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fbc6d93fb13cd308e83e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result33.insertedId}`);
        results.push(result33);

        const result34 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbb6d93fb13cd308e83d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ce05c3dc0690e6cf1bf"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result34.insertedId}`);
        results.push(result34);

        const result35 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbc6d93fb13cd308e83e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fbced93fb13cd308e83f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result35.insertedId}`);
        results.push(result35);

        const result36 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbced93fb13cd308e83f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fbd6d93fb13cd308e840"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result36.insertedId}`);
        results.push(result36);

        const result37 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbd6d93fb13cd308e840"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fbddd93fb13cd308e841"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result37.insertedId}`);
        results.push(result37);

        const result38 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbddd93fb13cd308e841"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fbeed93fb13cd308e842"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fbfed93fb13cd308e843"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result38.insertedId}`);
        results.push(result38);

        const result39 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbeed93fb13cd308e842"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8ab45c3dc0690e6cf19a"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8abf5c3dc0690e6cf19b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result39.insertedId}`);
        results.push(result39);

        const result40 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fbfed93fb13cd308e843"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fc0cd93fb13cd308e844"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result40.insertedId}`);
        results.push(result40);

        const result41 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc0cd93fb13cd308e844"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fc19d93fb13cd308e845"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fc21d93fb13cd308e846"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result41.insertedId}`);
        results.push(result41);

        const result42 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc19d93fb13cd308e845"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb89a95c3dc0690e6cf193"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb89c65c3dc0690e6cf194"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result42.insertedId}`);
        results.push(result42);

        const result43 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc21d93fb13cd308e846"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fc2bd93fb13cd308e847"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result43.insertedId}`);
        results.push(result43);

        const result44 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc2bd93fb13cd308e847"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fc32d93fb13cd308e848"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fc39d93fb13cd308e849"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result44.insertedId}`);
        results.push(result44);

        const result45 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc32d93fb13cd308e848"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fca7d93fb13cd308e84d"),
            transition: "incorrect"
        },
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe0af3b290562977865029"),
            transition: "correct"
        }
    ]
});
        console.log(`Document inserted with id: ${result45.insertedId}`);
        results.push(result45);

        const result46 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc39d93fb13cd308e849"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fc47d93fb13cd308e84a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result46.insertedId}`);
        results.push(result46);

        const result47 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc47d93fb13cd308e84a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fc5cd93fb13cd308e84b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result47.insertedId}`);
        results.push(result47);

        const result48 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fc5cd93fb13cd308e84b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe0c88031781a97964c378"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result48.insertedId}`);
        results.push(result48);

        const result49 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fca7d93fb13cd308e84d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fcb0d93fb13cd308e84e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result49.insertedId}`);
        results.push(result49);

        const result50 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcb0d93fb13cd308e84e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fcb7d93fb13cd308e84f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fcbed93fb13cd308e850"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result50.insertedId}`);
        results.push(result50);

        const result51 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcb7d93fb13cd308e84f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fce5d93fb13cd308e854"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result51.insertedId}`);
        results.push(result51);

        const result52 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcbed93fb13cd308e850"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fcc1d93fb13cd308e851"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result52.insertedId}`);
        results.push(result52);

        const result53 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcc1d93fb13cd308e851"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fccbd93fb13cd308e852"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result53.insertedId}`);
        results.push(result53);

        const result54 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fccbd93fb13cd308e852"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fcced93fb13cd308e853"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result54.insertedId}`);
        results.push(result54);

        const result55 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcced93fb13cd308e853"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result55.insertedId}`);
        results.push(result55);

        const result56 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fce5d93fb13cd308e854"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fcecd93fb13cd308e855"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result56.insertedId}`);
        results.push(result56);

        const result57 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fcecd93fb13cd308e855"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result57.insertedId}`);
        results.push(result57);

        const result58 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd2fd93fb13cd308e856"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fd7ad93fb13cd308e85a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result58.insertedId}`);
        results.push(result58);

        const result59 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd42d93fb13cd308e857"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: []
});
        console.log(`Document inserted with id: ${result59.insertedId}`);
        results.push(result59);

        const result60 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd7ad93fb13cd308e85a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fd81d93fb13cd308e85b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result60.insertedId}`);
        results.push(result60);

        const result61 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd81d93fb13cd308e85b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fd8ad93fb13cd308e85c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fd96d93fb13cd308e85d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result61.insertedId}`);
        results.push(result61);

        const result62 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd8ad93fb13cd308e85c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fdc9d93fb13cd308e85e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe0ad93fb13cd308e861"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result62.insertedId}`);
        results.push(result62);

        const result63 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fd96d93fb13cd308e85d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe52d93fb13cd308e867"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result63.insertedId}`);
        results.push(result63);

        const result64 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fdc9d93fb13cd308e85e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe3ed93fb13cd308e865"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result64.insertedId}`);
        results.push(result64);

        const result65 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe0ad93fb13cd308e861"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe0dd93fb13cd308e862"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result65.insertedId}`);
        results.push(result65);

        const result66 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe0dd93fb13cd308e862"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe15d93fb13cd308e863"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result66.insertedId}`);
        results.push(result66);

        const result67 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe15d93fb13cd308e863"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe18d93fb13cd308e864"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result67.insertedId}`);
        results.push(result67);

        const result68 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe18d93fb13cd308e864"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result68.insertedId}`);
        results.push(result68);

        const result69 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe3ed93fb13cd308e865"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe41d93fb13cd308e866"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result69.insertedId}`);
        results.push(result69);

        const result70 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe41d93fb13cd308e866"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result70.insertedId}`);
        results.push(result70);

        const result71 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe52d93fb13cd308e867"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fe58d93fb13cd308e868"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe61d93fb13cd308e869"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result71.insertedId}`);
        results.push(result71);

        const result72 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe58d93fb13cd308e868"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: []
});
        console.log(`Document inserted with id: ${result72.insertedId}`);
        results.push(result72);

        const result73 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe61d93fb13cd308e869"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe67d93fb13cd308e86a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result73.insertedId}`);
        results.push(result73);

        const result74 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe67d93fb13cd308e86a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7fe6ed93fb13cd308e86b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe7ad93fb13cd308e86c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result74.insertedId}`);
        results.push(result74);

        const result75 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe6ed93fb13cd308e86b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe93d93fb13cd308e870"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result75.insertedId}`);
        results.push(result75);

        const result76 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe7ad93fb13cd308e86c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe7dd93fb13cd308e86d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result76.insertedId}`);
        results.push(result76);

        const result77 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe7dd93fb13cd308e86d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fe84d93fb13cd308e86e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result77.insertedId}`);
        results.push(result77);

        const result78 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe84d93fb13cd308e86e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe87d93fb13cd308e86f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result78.insertedId}`);
        results.push(result78);

        const result79 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe87d93fb13cd308e86f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result79.insertedId}`);
        results.push(result79);

        const result80 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe93d93fb13cd308e870"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fe96d93fb13cd308e871"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result80.insertedId}`);
        results.push(result80);

        const result81 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fe96d93fb13cd308e871"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result81.insertedId}`);
        results.push(result81);

        const result82 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fec9d93fb13cd308e872"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f805e8d93fb13cd308e91c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result82.insertedId}`);
        results.push(result82);

        const result83 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fed5d93fb13cd308e873"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fed9d93fb13cd308e874"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result83.insertedId}`);
        results.push(result83);

        const result84 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fed9d93fb13cd308e874"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7feded93fb13cd308e875"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result84.insertedId}`);
        results.push(result84);

        const result85 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7feded93fb13cd308e875"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fee3d93fb13cd308e876"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result85.insertedId}`);
        results.push(result85);

        const result86 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fee3d93fb13cd308e876"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7feeed93fb13cd308e877"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fefad93fb13cd308e878"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result86.insertedId}`);
        results.push(result86);

        const result87 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7feeed93fb13cd308e877"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ff0dd93fb13cd308e879"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff17d93fb13cd308e87a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result87.insertedId}`);
        results.push(result87);

        const result88 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fefad93fb13cd308e878"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: []
});
        console.log(`Document inserted with id: ${result88.insertedId}`);
        results.push(result88);

        const result89 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff0dd93fb13cd308e879"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ff20d93fb13cd308e87b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff2bd93fb13cd308e87c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result89.insertedId}`);
        results.push(result89);

        const result90 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff17d93fb13cd308e87a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd0ffd1f17f7ead8e7632"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd10bd1f17f7ead8e7633"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result90.insertedId}`);
        results.push(result90);

        const result91 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff20d93fb13cd308e87b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ff71d93fb13cd308e885"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff7cd93fb13cd308e886"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result91.insertedId}`);
        results.push(result91);

        const result92 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff2bd93fb13cd308e87c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ff31d93fb13cd308e87d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result92.insertedId}`);
        results.push(result92);

        const result93 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff31d93fb13cd308e87d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ff37d93fb13cd308e87e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff3fd93fb13cd308e87f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result93.insertedId}`);
        results.push(result93);

        const result94 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff37d93fb13cd308e87e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff5fd93fb13cd308e883"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result94.insertedId}`);
        results.push(result94);

        const result95 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff3fd93fb13cd308e87f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ff42d93fb13cd308e880"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result95.insertedId}`);
        results.push(result95);

        const result96 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff42d93fb13cd308e880"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ff48d93fb13cd308e881"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result96.insertedId}`);
        results.push(result96);

        const result97 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff48d93fb13cd308e881"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ff4dd93fb13cd308e882"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result97.insertedId}`);
        results.push(result97);

        const result98 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff4dd93fb13cd308e882"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result98.insertedId}`);
        results.push(result98);

        const result99 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff5fd93fb13cd308e883"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ff65d93fb13cd308e884"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result99.insertedId}`);
        results.push(result99);

        const result100 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff65d93fb13cd308e884"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result100.insertedId}`);
        results.push(result100);

        const result101 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff71d93fb13cd308e885"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ffbcd93fb13cd308e887"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ffc6d93fb13cd308e888"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result101.insertedId}`);
        results.push(result101);

        const result102 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ff7cd93fb13cd308e886"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: []
});
        console.log(`Document inserted with id: ${result102.insertedId}`);
        results.push(result102);

        const result103 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffbcd93fb13cd308e887"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f8000bd93fb13cd308e891"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80011d93fb13cd308e892"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result103.insertedId}`);
        results.push(result103);

        const result104 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffc6d93fb13cd308e888"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ffcfd93fb13cd308e889"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result104.insertedId}`);
        results.push(result104);

        const result105 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffcfd93fb13cd308e889"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f7ffd9d93fb13cd308e88a"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ffe1d93fb13cd308e88b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result105.insertedId}`);
        results.push(result105);

        const result106 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffd9d93fb13cd308e88a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7fff6d93fb13cd308e88f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result106.insertedId}`);
        results.push(result106);

        const result107 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffe1d93fb13cd308e88b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ffe4d93fb13cd308e88c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result107.insertedId}`);
        results.push(result107);

        const result108 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffe4d93fb13cd308e88c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f7ffead93fb13cd308e88d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result108.insertedId}`);
        results.push(result108);

        const result109 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffead93fb13cd308e88d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7ffecd93fb13cd308e88e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result109.insertedId}`);
        results.push(result109);

        const result110 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7ffecd93fb13cd308e88e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result110.insertedId}`);
        results.push(result110);

        const result111 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fff6d93fb13cd308e88f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f7fff8d93fb13cd308e890"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result111.insertedId}`);
        results.push(result111);

        const result112 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7fff8d93fb13cd308e890"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result112.insertedId}`);
        results.push(result112);

        const result113 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8000bd93fb13cd308e891"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f8006fd93fb13cd308e89b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80075d93fb13cd308e89c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result113.insertedId}`);
        results.push(result113);

        const result114 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80011d93fb13cd308e892"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8001dd93fb13cd308e893"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result114.insertedId}`);
        results.push(result114);

        const result115 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8001dd93fb13cd308e893"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80022d93fb13cd308e894"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8002fd93fb13cd308e895"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result115.insertedId}`);
        results.push(result115);

        const result116 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80022d93fb13cd308e894"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80047d93fb13cd308e899"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result116.insertedId}`);
        results.push(result116);

        const result117 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8002fd93fb13cd308e895"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80032d93fb13cd308e896"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result117.insertedId}`);
        results.push(result117);

        const result118 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80032d93fb13cd308e896"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80039d93fb13cd308e897"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result118.insertedId}`);
        results.push(result118);

        const result119 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80039d93fb13cd308e897"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8003ed93fb13cd308e898"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result119.insertedId}`);
        results.push(result119);

        const result120 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8003ed93fb13cd308e898"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result120.insertedId}`);
        results.push(result120);

        const result121 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80047d93fb13cd308e899"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8004ad93fb13cd308e89a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result121.insertedId}`);
        results.push(result121);

        const result122 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8004ad93fb13cd308e89a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result122.insertedId}`);
        results.push(result122);

        const result123 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8006fd93fb13cd308e89b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f800ced93fb13cd308e8a5"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f800d7d93fb13cd308e8a6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result123.insertedId}`);
        results.push(result123);

        const result124 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80075d93fb13cd308e89c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8007ad93fb13cd308e89d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result124.insertedId}`);
        results.push(result124);

        const result125 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8007ad93fb13cd308e89d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80080d93fb13cd308e89e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80087d93fb13cd308e89f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result125.insertedId}`);
        results.push(result125);

        const result126 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80080d93fb13cd308e89e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f800a4d93fb13cd308e8a3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result126.insertedId}`);
        results.push(result126);

        const result127 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80087d93fb13cd308e89f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80090d93fb13cd308e8a0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result127.insertedId}`);
        results.push(result127);

        const result128 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80090d93fb13cd308e8a0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80099d93fb13cd308e8a1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result128.insertedId}`);
        results.push(result128);

        const result129 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80099d93fb13cd308e8a1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8009dd93fb13cd308e8a2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result129.insertedId}`);
        results.push(result129);

        const result130 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8009dd93fb13cd308e8a2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result130.insertedId}`);
        results.push(result130);

        const result131 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800a4d93fb13cd308e8a3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f800a7d93fb13cd308e8a4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result131.insertedId}`);
        results.push(result131);

        const result132 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800a7d93fb13cd308e8a4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result132.insertedId}`);
        results.push(result132);

        const result133 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800ced93fb13cd308e8a5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80497d93fb13cd308e90b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f804a7d93fb13cd308e90c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result133.insertedId}`);
        results.push(result133);

        const result134 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800d7d93fb13cd308e8a6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f800ddd93fb13cd308e8a7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result134.insertedId}`);
        results.push(result134);

        const result135 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800ddd93fb13cd308e8a7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f800edd93fb13cd308e8a8"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f800f8d93fb13cd308e8a9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result135.insertedId}`);
        results.push(result135);

        const result136 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800edd93fb13cd308e8a8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80152d93fb13cd308e8b2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80158d93fb13cd308e8b3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result136.insertedId}`);
        results.push(result136);

        const result137 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f800f8d93fb13cd308e8a9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80120d93fb13cd308e8aa"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result137.insertedId}`);
        results.push(result137);

        const result138 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80120d93fb13cd308e8aa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80126d93fb13cd308e8ab"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8012cd93fb13cd308e8ac"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result138.insertedId}`);
        results.push(result138);

        const result139 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80126d93fb13cd308e8ab"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80143d93fb13cd308e8b0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result139.insertedId}`);
        results.push(result139);

        const result140 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8012cd93fb13cd308e8ac"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80130d93fb13cd308e8ad"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result140.insertedId}`);
        results.push(result140);

        const result141 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80130d93fb13cd308e8ad"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80136d93fb13cd308e8ae"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result141.insertedId}`);
        results.push(result141);

        const result142 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80136d93fb13cd308e8ae"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80139d93fb13cd308e8af"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result142.insertedId}`);
        results.push(result142);

        const result143 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80139d93fb13cd308e8af"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result143.insertedId}`);
        results.push(result143);

        const result144 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80143d93fb13cd308e8b0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80146d93fb13cd308e8b1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result144.insertedId}`);
        results.push(result144);

        const result145 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80146d93fb13cd308e8b1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result145.insertedId}`);
        results.push(result145);

        const result146 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80152d93fb13cd308e8b2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f803e8d93fb13cd308e8fa"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f803f0d93fb13cd308e8fb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result146.insertedId}`);
        results.push(result146);

        const result147 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80158d93fb13cd308e8b3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8015ed93fb13cd308e8b4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result147.insertedId}`);
        results.push(result147);

        const result148 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8015ed93fb13cd308e8b4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80165d93fb13cd308e8b5"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80198d93fb13cd308e8b7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result148.insertedId}`);
        results.push(result148);

        const result149 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80165d93fb13cd308e8b5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f801ead93fb13cd308e8c0"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f801efd93fb13cd308e8c1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result149.insertedId}`);
        results.push(result149);

        const result150 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80198d93fb13cd308e8b7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f801a4d93fb13cd308e8b8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result150.insertedId}`);
        results.push(result150);

        const result151 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801a4d93fb13cd308e8b8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f801add93fb13cd308e8b9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f801b3d93fb13cd308e8ba"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result151.insertedId}`);
        results.push(result151);

        const result152 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801add93fb13cd308e8b9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f801d3d93fb13cd308e8be"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result152.insertedId}`);
        results.push(result152);

        const result153 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801b3d93fb13cd308e8ba"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f801b7d93fb13cd308e8bb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result153.insertedId}`);
        results.push(result153);

        const result154 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801b7d93fb13cd308e8bb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f801bcd93fb13cd308e8bc"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result154.insertedId}`);
        results.push(result154);

        const result155 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801bcd93fb13cd308e8bc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f801bfd93fb13cd308e8bd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result155.insertedId}`);
        results.push(result155);

        const result156 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801bfd93fb13cd308e8bd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result156.insertedId}`);
        results.push(result156);

        const result157 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801d3d93fb13cd308e8be"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f801dbd93fb13cd308e8bf"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result157.insertedId}`);
        results.push(result157);

        const result158 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801dbd93fb13cd308e8bf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result158.insertedId}`);
        results.push(result158);

        const result159 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801ead93fb13cd308e8c0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80362d93fb13cd308e8e9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8036cd93fb13cd308e8ea"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result159.insertedId}`);
        results.push(result159);

        const result160 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f801efd93fb13cd308e8c1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8020fd93fb13cd308e8c2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result160.insertedId}`);
        results.push(result160);

        const result161 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8020fd93fb13cd308e8c2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80217d93fb13cd308e8c3"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8021ed93fb13cd308e8c4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result161.insertedId}`);
        results.push(result161);

        const result162 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80217d93fb13cd308e8c3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80294d93fb13cd308e8ce"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8029bd93fb13cd308e8cf"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result162.insertedId}`);
        results.push(result162);

        const result163 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8021ed93fb13cd308e8c4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80223d93fb13cd308e8c5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result163.insertedId}`);
        results.push(result163);

        const result164 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80223d93fb13cd308e8c5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80227d93fb13cd308e8c6"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8022fd93fb13cd308e8c7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result164.insertedId}`);
        results.push(result164);

        const result165 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80227d93fb13cd308e8c6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80243d93fb13cd308e8cb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result165.insertedId}`);
        results.push(result165);

        const result166 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8022fd93fb13cd308e8c7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80231d93fb13cd308e8c8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result166.insertedId}`);
        results.push(result166);

        const result167 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80231d93fb13cd308e8c8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80238d93fb13cd308e8c9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result167.insertedId}`);
        results.push(result167);

        const result168 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80238d93fb13cd308e8c9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8023bd93fb13cd308e8ca"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result168.insertedId}`);
        results.push(result168);

        const result169 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8023bd93fb13cd308e8ca"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result169.insertedId}`);
        results.push(result169);

        const result170 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80243d93fb13cd308e8cb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80284d93fb13cd308e8cd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result170.insertedId}`);
        results.push(result170);

        const result171 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80284d93fb13cd308e8cd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result171.insertedId}`);
        results.push(result171);

        const result172 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80294d93fb13cd308e8ce"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f802dad93fb13cd308e8d8"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802e3d93fb13cd308e8d9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result172.insertedId}`);
        results.push(result172);

        const result173 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8029bd93fb13cd308e8cf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802a0d93fb13cd308e8d0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result173.insertedId}`);
        results.push(result173);

        const result174 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802a0d93fb13cd308e8d0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f802a6d93fb13cd308e8d1"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802aed93fb13cd308e8d2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result174.insertedId}`);
        results.push(result174);

        const result175 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802a6d93fb13cd308e8d1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802c5d93fb13cd308e8d6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result175.insertedId}`);
        results.push(result175);

        const result176 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802aed93fb13cd308e8d2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802b0d93fb13cd308e8d3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result176.insertedId}`);
        results.push(result176);

        const result177 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802b0d93fb13cd308e8d3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802b6d93fb13cd308e8d4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result177.insertedId}`);
        results.push(result177);

        const result178 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802b6d93fb13cd308e8d4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802bdd93fb13cd308e8d5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result178.insertedId}`);
        results.push(result178);

        const result179 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802bdd93fb13cd308e8d5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result179.insertedId}`);
        results.push(result179);

        const result180 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802c5d93fb13cd308e8d6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802c8d93fb13cd308e8d7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result180.insertedId}`);
        results.push(result180);

        const result181 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802c8d93fb13cd308e8d7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result181.insertedId}`);
        results.push(result181);

        const result182 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802dad93fb13cd308e8d8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80327d93fb13cd308e8e2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8032dd93fb13cd308e8e3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result182.insertedId}`);
        results.push(result182);

        const result183 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802e3d93fb13cd308e8d9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802e8d93fb13cd308e8da"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result183.insertedId}`);
        results.push(result183);

        const result184 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802e8d93fb13cd308e8da"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f802efd93fb13cd308e8db"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802f3d93fb13cd308e8dc"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result184.insertedId}`);
        results.push(result184);

        const result185 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802efd93fb13cd308e8db"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80306d93fb13cd308e8e0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result185.insertedId}`);
        results.push(result185);

        const result186 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802f3d93fb13cd308e8dc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802f7d93fb13cd308e8dd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result186.insertedId}`);
        results.push(result186);

        const result187 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802f7d93fb13cd308e8dd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f802fdd93fb13cd308e8de"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result187.insertedId}`);
        results.push(result187);

        const result188 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802fdd93fb13cd308e8de"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f802ffd93fb13cd308e8df"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result188.insertedId}`);
        results.push(result188);

        const result189 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f802ffd93fb13cd308e8df"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result189.insertedId}`);
        results.push(result189);

        const result190 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80306d93fb13cd308e8e0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80308d93fb13cd308e8e1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result190.insertedId}`);
        results.push(result190);

        const result191 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80308d93fb13cd308e8e1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result191.insertedId}`);
        results.push(result191);

        const result192 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80327d93fb13cd308e8e2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80340d93fb13cd308e8e7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result192.insertedId}`);
        results.push(result192);

        const result193 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8032dd93fb13cd308e8e3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80330d93fb13cd308e8e4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result193.insertedId}`);
        results.push(result193);

        const result194 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80330d93fb13cd308e8e4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80336d93fb13cd308e8e5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result194.insertedId}`);
        results.push(result194);

        const result195 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80336d93fb13cd308e8e5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8033ad93fb13cd308e8e6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result195.insertedId}`);
        results.push(result195);

        const result196 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8033ad93fb13cd308e8e6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result196.insertedId}`);
        results.push(result196);

        const result197 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80340d93fb13cd308e8e7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80344d93fb13cd308e8e8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result197.insertedId}`);
        results.push(result197);

        const result198 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80344d93fb13cd308e8e8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result198.insertedId}`);
        results.push(result198);

        const result199 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80362d93fb13cd308e8e9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f803a2d93fb13cd308e8f3"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f803b2d93fb13cd308e8f4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result199.insertedId}`);
        results.push(result199);

        const result200 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8036cd93fb13cd308e8ea"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80370d93fb13cd308e8eb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result200.insertedId}`);
        results.push(result200);

        const result201 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80370d93fb13cd308e8eb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80375d93fb13cd308e8ec"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80378d93fb13cd308e8ed"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result201.insertedId}`);
        results.push(result201);

        const result202 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80375d93fb13cd308e8ec"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8038dd93fb13cd308e8f1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result202.insertedId}`);
        results.push(result202);

        const result203 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80378d93fb13cd308e8ed"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8037cd93fb13cd308e8ee"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result203.insertedId}`);
        results.push(result203);

        const result204 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8037cd93fb13cd308e8ee"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80382d93fb13cd308e8ef"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result204.insertedId}`);
        results.push(result204);

        const result205 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80382d93fb13cd308e8ef"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80386d93fb13cd308e8f0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result205.insertedId}`);
        results.push(result205);

        const result206 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80386d93fb13cd308e8f0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result206.insertedId}`);
        results.push(result206);

        const result207 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8038dd93fb13cd308e8f1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80390d93fb13cd308e8f2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result207.insertedId}`);
        results.push(result207);

        const result208 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80390d93fb13cd308e8f2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result208.insertedId}`);
        results.push(result208);

        const result209 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803a2d93fb13cd308e8f3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f803c5d93fb13cd308e8f8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result209.insertedId}`);
        results.push(result209);

        const result210 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803b2d93fb13cd308e8f4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f803b5d93fb13cd308e8f5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result210.insertedId}`);
        results.push(result210);

        const result211 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803b5d93fb13cd308e8f5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f803bbd93fb13cd308e8f6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result211.insertedId}`);
        results.push(result211);

        const result212 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803bbd93fb13cd308e8f6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f803bdd93fb13cd308e8f7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result212.insertedId}`);
        results.push(result212);

        const result213 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803bdd93fb13cd308e8f7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result213.insertedId}`);
        results.push(result213);

        const result214 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803c5d93fb13cd308e8f8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f803c7d93fb13cd308e8f9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result214.insertedId}`);
        results.push(result214);

        const result215 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803c7d93fb13cd308e8f9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result215.insertedId}`);
        results.push(result215);

        const result216 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803e8d93fb13cd308e8fa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80447d93fb13cd308e904"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8044dd93fb13cd308e905"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result216.insertedId}`);
        results.push(result216);

        const result217 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803f0d93fb13cd308e8fb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f803f5d93fb13cd308e8fc"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result217.insertedId}`);
        results.push(result217);

        const result218 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803f5d93fb13cd308e8fc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f803fad93fb13cd308e8fd"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f803ffd93fb13cd308e8fe"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result218.insertedId}`);
        results.push(result218);

        const result219 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803fad93fb13cd308e8fd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80412d93fb13cd308e902"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result219.insertedId}`);
        results.push(result219);

        const result220 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f803ffd93fb13cd308e8fe"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80402d93fb13cd308e8ff"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result220.insertedId}`);
        results.push(result220);

        const result221 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80402d93fb13cd308e8ff"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80408d93fb13cd308e900"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result221.insertedId}`);
        results.push(result221);

        const result222 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80408d93fb13cd308e900"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8040bd93fb13cd308e901"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result222.insertedId}`);
        results.push(result222);

        const result223 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8040bd93fb13cd308e901"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result223.insertedId}`);
        results.push(result223);

        const result224 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80412d93fb13cd308e902"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80414d93fb13cd308e903"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result224.insertedId}`);
        results.push(result224);

        const result225 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80414d93fb13cd308e903"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result225.insertedId}`);
        results.push(result225);

        const result226 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80447d93fb13cd308e904"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80465d93fb13cd308e909"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result226.insertedId}`);
        results.push(result226);

        const result227 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8044dd93fb13cd308e905"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80450d93fb13cd308e906"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result227.insertedId}`);
        results.push(result227);

        const result228 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80450d93fb13cd308e906"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80456d93fb13cd308e907"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result228.insertedId}`);
        results.push(result228);

        const result229 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80456d93fb13cd308e907"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8045ad93fb13cd308e908"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result229.insertedId}`);
        results.push(result229);

        const result230 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8045ad93fb13cd308e908"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result230.insertedId}`);
        results.push(result230);

        const result231 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80465d93fb13cd308e909"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80469d93fb13cd308e90a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result231.insertedId}`);
        results.push(result231);

        const result232 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80469d93fb13cd308e90a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result232.insertedId}`);
        results.push(result232);

        const result233 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80497d93fb13cd308e90b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f804fcd93fb13cd308e915"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80507d93fb13cd308e916"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result233.insertedId}`);
        results.push(result233);

        const result234 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804a7d93fb13cd308e90c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f804b1d93fb13cd308e90d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result234.insertedId}`);
        results.push(result234);

        const result235 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804b1d93fb13cd308e90d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f804bbd93fb13cd308e90e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f804bfd93fb13cd308e90f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result235.insertedId}`);
        results.push(result235);

        const result236 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804bbd93fb13cd308e90e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f804d1d93fb13cd308e913"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result236.insertedId}`);
        results.push(result236);

        const result237 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804bfd93fb13cd308e90f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f804c2d93fb13cd308e910"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result237.insertedId}`);
        results.push(result237);

        const result238 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804c2d93fb13cd308e910"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f804c8d93fb13cd308e911"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result238.insertedId}`);
        results.push(result238);

        const result239 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804c8d93fb13cd308e911"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f804cad93fb13cd308e912"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result239.insertedId}`);
        results.push(result239);

        const result240 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804cad93fb13cd308e912"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result240.insertedId}`);
        results.push(result240);

        const result241 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804d1d93fb13cd308e913"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f804d4d93fb13cd308e914"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result241.insertedId}`);
        results.push(result241);

        const result242 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804d4d93fb13cd308e914"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result242.insertedId}`);
        results.push(result242);

        const result243 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f804fcd93fb13cd308e915"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8051cd93fb13cd308e91a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result243.insertedId}`);
        results.push(result243);

        const result244 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80507d93fb13cd308e916"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8050ad93fb13cd308e917"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result244.insertedId}`);
        results.push(result244);

        const result245 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8050ad93fb13cd308e917"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80510d93fb13cd308e918"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result245.insertedId}`);
        results.push(result245);

        const result246 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80510d93fb13cd308e918"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80513d93fb13cd308e919"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result246.insertedId}`);
        results.push(result246);

        const result247 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80513d93fb13cd308e919"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result247.insertedId}`);
        results.push(result247);

        const result248 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8051cd93fb13cd308e91a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8051fd93fb13cd308e91b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result248.insertedId}`);
        results.push(result248);

        const result249 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8051fd93fb13cd308e91b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result249.insertedId}`);
        results.push(result249);

        const result250 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f805e8d93fb13cd308e91c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f805f0d93fb13cd308e91d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result250.insertedId}`);
        results.push(result250);

        const result251 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f805f0d93fb13cd308e91d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f8060bd93fb13cd308e91f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8063ad93fb13cd308e920"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result251.insertedId}`);
        results.push(result251);

        const result252 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8060bd93fb13cd308e91f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f806f8d93fb13cd308e933"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f806fdd93fb13cd308e934"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result252.insertedId}`);
        results.push(result252);

        const result253 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8063ad93fb13cd308e920"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80641d93fb13cd308e921"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result253.insertedId}`);
        results.push(result253);

        const result254 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80641d93fb13cd308e921"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80652d93fb13cd308e922"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80658d93fb13cd308e923"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result254.insertedId}`);
        results.push(result254);

        const result255 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80652d93fb13cd308e922"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f806c8d93fb13cd308e92c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f806d3d93fb13cd308e92d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result255.insertedId}`);
        results.push(result255);

        const result256 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80658d93fb13cd308e923"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80660d93fb13cd308e924"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result256.insertedId}`);
        results.push(result256);

        const result257 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80660d93fb13cd308e924"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80665d93fb13cd308e925"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80669d93fb13cd308e926"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result257.insertedId}`);
        results.push(result257);

        const result258 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80665d93fb13cd308e925"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8067cd93fb13cd308e92a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result258.insertedId}`);
        results.push(result258);

        const result259 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80669d93fb13cd308e926"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8066bd93fb13cd308e927"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result259.insertedId}`);
        results.push(result259);

        const result260 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8066bd93fb13cd308e927"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80671d93fb13cd308e928"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result260.insertedId}`);
        results.push(result260);

        const result261 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80671d93fb13cd308e928"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80673d93fb13cd308e929"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result261.insertedId}`);
        results.push(result261);

        const result262 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80673d93fb13cd308e929"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result262.insertedId}`);
        results.push(result262);

        const result263 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8067cd93fb13cd308e92a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8067fd93fb13cd308e92b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result263.insertedId}`);
        results.push(result263);

        const result264 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8067fd93fb13cd308e92b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result264.insertedId}`);
        results.push(result264);

        const result265 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806c8d93fb13cd308e92c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f806e4d93fb13cd308e931"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result265.insertedId}`);
        results.push(result265);

        const result266 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806d3d93fb13cd308e92d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f806d6d93fb13cd308e92e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result266.insertedId}`);
        results.push(result266);

        const result267 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806d6d93fb13cd308e92e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f806dbd93fb13cd308e92f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result267.insertedId}`);
        results.push(result267);

        const result268 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806dbd93fb13cd308e92f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f806ddd93fb13cd308e930"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result268.insertedId}`);
        results.push(result268);

        const result269 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806ddd93fb13cd308e930"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result269.insertedId}`);
        results.push(result269);

        const result270 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806e4d93fb13cd308e931"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f806e6d93fb13cd308e932"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result270.insertedId}`);
        results.push(result270);

        const result271 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806e6d93fb13cd308e932"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result271.insertedId}`);
        results.push(result271);

        const result272 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806f8d93fb13cd308e933"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1ae0031781a97964c4ae"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1ae4031781a97964c4af"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result272.insertedId}`);
        results.push(result272);

        const result273 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f806fdd93fb13cd308e934"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80709d93fb13cd308e935"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result273.insertedId}`);
        results.push(result273);

        const result274 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80709d93fb13cd308e935"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80714d93fb13cd308e936"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80719d93fb13cd308e937"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result274.insertedId}`);
        results.push(result274);

        const result275 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80714d93fb13cd308e936"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: []
});
        console.log(`Document inserted with id: ${result275.insertedId}`);
        results.push(result275);

        const result276 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80719d93fb13cd308e937"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80720d93fb13cd308e938"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result276.insertedId}`);
        results.push(result276);

        const result277 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80720d93fb13cd308e938"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67f80746d93fb13cd308e939"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f8074ad93fb13cd308e93a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result277.insertedId}`);
        results.push(result277);

        const result278 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80746d93fb13cd308e939"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80761d93fb13cd308e93e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result278.insertedId}`);
        results.push(result278);

        const result279 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8074ad93fb13cd308e93a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f8074ed93fb13cd308e93b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result279.insertedId}`);
        results.push(result279);

        const result280 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f8074ed93fb13cd308e93b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67f80756d93fb13cd308e93c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result280.insertedId}`);
        results.push(result280);

        const result281 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80756d93fb13cd308e93c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80758d93fb13cd308e93d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result281.insertedId}`);
        results.push(result281);

        const result282 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80758d93fb13cd308e93d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result282.insertedId}`);
        results.push(result282);

        const result283 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80761d93fb13cd308e93e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67f80766d93fb13cd308e93f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result283.insertedId}`);
        results.push(result283);

        const result284 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f80766d93fb13cd308e93f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result284.insertedId}`);
        results.push(result284);

        const result285 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89a95c3dc0690e6cf193"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb89dc5c3dc0690e6cf198"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result285.insertedId}`);
        results.push(result285);

        const result286 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89c65c3dc0690e6cf194"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb89c95c3dc0690e6cf195"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result286.insertedId}`);
        results.push(result286);

        const result287 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89c95c3dc0690e6cf195"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb89d05c3dc0690e6cf196"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result287.insertedId}`);
        results.push(result287);

        const result288 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89d05c3dc0690e6cf196"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb89d45c3dc0690e6cf197"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result288.insertedId}`);
        results.push(result288);

        const result289 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89d45c3dc0690e6cf197"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result289.insertedId}`);
        results.push(result289);

        const result290 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89dc5c3dc0690e6cf198"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb89df5c3dc0690e6cf199"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result290.insertedId}`);
        results.push(result290);

        const result291 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb89df5c3dc0690e6cf199"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result291.insertedId}`);
        results.push(result291);

        const result292 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ab45c3dc0690e6cf19a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8c0e5c3dc0690e6cf1ae"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8c1d5c3dc0690e6cf1af"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result292.insertedId}`);
        results.push(result292);

        const result293 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8abf5c3dc0690e6cf19b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ac55c3dc0690e6cf19c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result293.insertedId}`);
        results.push(result293);

        const result294 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ac55c3dc0690e6cf19c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8ace5c3dc0690e6cf19d"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8adf5c3dc0690e6cf19e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result294.insertedId}`);
        results.push(result294);

        const result295 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ace5c3dc0690e6cf19d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8b8c5c3dc0690e6cf1a7"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8b925c3dc0690e6cf1a8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result295.insertedId}`);
        results.push(result295);

        const result296 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8adf5c3dc0690e6cf19e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8b055c3dc0690e6cf19f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result296.insertedId}`);
        results.push(result296);

        const result297 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b055c3dc0690e6cf19f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8b0c5c3dc0690e6cf1a0"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8b125c3dc0690e6cf1a1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result297.insertedId}`);
        results.push(result297);

        const result298 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b0c5c3dc0690e6cf1a0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8b285c3dc0690e6cf1a5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result298.insertedId}`);
        results.push(result298);

        const result299 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b125c3dc0690e6cf1a1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8b145c3dc0690e6cf1a2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result299.insertedId}`);
        results.push(result299);

        const result300 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b145c3dc0690e6cf1a2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8b1d5c3dc0690e6cf1a3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result300.insertedId}`);
        results.push(result300);

        const result301 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b1d5c3dc0690e6cf1a3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8b1f5c3dc0690e6cf1a4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result301.insertedId}`);
        results.push(result301);

        const result302 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b1f5c3dc0690e6cf1a4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result302.insertedId}`);
        results.push(result302);

        const result303 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b285c3dc0690e6cf1a5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8b2b5c3dc0690e6cf1a6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result303.insertedId}`);
        results.push(result303);

        const result304 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b2b5c3dc0690e6cf1a6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result304.insertedId}`);
        results.push(result304);

        const result305 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b8c5c3dc0690e6cf1a7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8be05c3dc0690e6cf1ac"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result305.insertedId}`);
        results.push(result305);

        const result306 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b925c3dc0690e6cf1a8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8b955c3dc0690e6cf1a9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result306.insertedId}`);
        results.push(result306);

        const result307 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b955c3dc0690e6cf1a9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8b9d5c3dc0690e6cf1aa"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result307.insertedId}`);
        results.push(result307);

        const result308 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8b9d5c3dc0690e6cf1aa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ba35c3dc0690e6cf1ab"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result308.insertedId}`);
        results.push(result308);

        const result309 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ba35c3dc0690e6cf1ab"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result309.insertedId}`);
        results.push(result309);

        const result310 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8be05c3dc0690e6cf1ac"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8be35c3dc0690e6cf1ad"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result310.insertedId}`);
        results.push(result310);

        const result311 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8be35c3dc0690e6cf1ad"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result311.insertedId}`);
        results.push(result311);

        const result312 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c0e5c3dc0690e6cf1ae"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8c935c3dc0690e6cf1b8"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8c9a5c3dc0690e6cf1b9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result312.insertedId}`);
        results.push(result312);

        const result313 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c1d5c3dc0690e6cf1af"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8c245c3dc0690e6cf1b0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result313.insertedId}`);
        results.push(result313);

        const result314 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c245c3dc0690e6cf1b0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8c295c3dc0690e6cf1b1"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8c325c3dc0690e6cf1b2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result314.insertedId}`);
        results.push(result314);

        const result315 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c295c3dc0690e6cf1b1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8c4b5c3dc0690e6cf1b6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result315.insertedId}`);
        results.push(result315);

        const result316 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c325c3dc0690e6cf1b2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8c385c3dc0690e6cf1b3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result316.insertedId}`);
        results.push(result316);

        const result317 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c385c3dc0690e6cf1b3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8c3e5c3dc0690e6cf1b4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result317.insertedId}`);
        results.push(result317);

        const result318 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c3e5c3dc0690e6cf1b4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8c415c3dc0690e6cf1b5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result318.insertedId}`);
        results.push(result318);

        const result319 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c415c3dc0690e6cf1b5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result319.insertedId}`);
        results.push(result319);

        const result320 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c4b5c3dc0690e6cf1b6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8c4f5c3dc0690e6cf1b7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result320.insertedId}`);
        results.push(result320);

        const result321 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c4f5c3dc0690e6cf1b7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result321.insertedId}`);
        results.push(result321);

        const result322 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c935c3dc0690e6cf1b8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8cb25c3dc0690e6cf1bd"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result322.insertedId}`);
        results.push(result322);

        const result323 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8c9a5c3dc0690e6cf1b9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ca05c3dc0690e6cf1ba"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result323.insertedId}`);
        results.push(result323);

        const result324 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ca05c3dc0690e6cf1ba"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8ca65c3dc0690e6cf1bb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result324.insertedId}`);
        results.push(result324);

        const result325 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ca65c3dc0690e6cf1bb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ca95c3dc0690e6cf1bc"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result325.insertedId}`);
        results.push(result325);

        const result326 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ca95c3dc0690e6cf1bc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result326.insertedId}`);
        results.push(result326);

        const result327 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8cb25c3dc0690e6cf1bd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8cb45c3dc0690e6cf1be"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result327.insertedId}`);
        results.push(result327);

        const result328 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8cb45c3dc0690e6cf1be"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result328.insertedId}`);
        results.push(result328);

        const result329 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ce05c3dc0690e6cf1bf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ce55c3dc0690e6cf1c0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result329.insertedId}`);
        results.push(result329);

        const result330 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ce55c3dc0690e6cf1c0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8cf35c3dc0690e6cf1c1"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d015c3dc0690e6cf1c2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result330.insertedId}`);
        results.push(result330);

        const result331 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8cf35c3dc0690e6cf1c1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8d7f5c3dc0690e6cf1d5"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d875c3dc0690e6cf1d6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result331.insertedId}`);
        results.push(result331);

        const result332 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d015c3dc0690e6cf1c2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d095c3dc0690e6cf1c3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result332.insertedId}`);
        results.push(result332);

        const result333 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d095c3dc0690e6cf1c3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8d1c5c3dc0690e6cf1c4"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d265c3dc0690e6cf1c5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result333.insertedId}`);
        results.push(result333);

        const result334 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d1c5c3dc0690e6cf1c4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8d565c3dc0690e6cf1ce"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d5a5c3dc0690e6cf1cf"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result334.insertedId}`);
        results.push(result334);

        const result335 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d265c3dc0690e6cf1c5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d295c3dc0690e6cf1c6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result335.insertedId}`);
        results.push(result335);

        const result336 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d295c3dc0690e6cf1c6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8d2e5c3dc0690e6cf1c7"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d325c3dc0690e6cf1c8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result336.insertedId}`);
        results.push(result336);

        const result337 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d2e5c3dc0690e6cf1c7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d465c3dc0690e6cf1cc"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result337.insertedId}`);
        results.push(result337);

        const result338 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d325c3dc0690e6cf1c8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d355c3dc0690e6cf1c9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result338.insertedId}`);
        results.push(result338);

        const result339 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d355c3dc0690e6cf1c9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d3b5c3dc0690e6cf1ca"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result339.insertedId}`);
        results.push(result339);

        const result340 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d3b5c3dc0690e6cf1ca"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d3e5c3dc0690e6cf1cb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result340.insertedId}`);
        results.push(result340);

        const result341 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d3e5c3dc0690e6cf1cb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result341.insertedId}`);
        results.push(result341);

        const result342 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d465c3dc0690e6cf1cc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d495c3dc0690e6cf1cd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result342.insertedId}`);
        results.push(result342);

        const result343 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d495c3dc0690e6cf1cd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result343.insertedId}`);
        results.push(result343);

        const result344 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d565c3dc0690e6cf1ce"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d705c3dc0690e6cf1d3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result344.insertedId}`);
        results.push(result344);

        const result345 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d5a5c3dc0690e6cf1cf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d5d5c3dc0690e6cf1d0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result345.insertedId}`);
        results.push(result345);

        const result346 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d5d5c3dc0690e6cf1d0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d625c3dc0690e6cf1d1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result346.insertedId}`);
        results.push(result346);

        const result347 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d625c3dc0690e6cf1d1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d645c3dc0690e6cf1d2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result347.insertedId}`);
        results.push(result347);

        const result348 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d645c3dc0690e6cf1d2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result348.insertedId}`);
        results.push(result348);

        const result349 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d705c3dc0690e6cf1d3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d725c3dc0690e6cf1d4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result349.insertedId}`);
        results.push(result349);

        const result350 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d725c3dc0690e6cf1d4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result350.insertedId}`);
        results.push(result350);

        const result351 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d7f5c3dc0690e6cf1d5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8e005c3dc0690e6cf1e9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e0f5c3dc0690e6cf1ea"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result351.insertedId}`);
        results.push(result351);

        const result352 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d875c3dc0690e6cf1d6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d8a5c3dc0690e6cf1d7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result352.insertedId}`);
        results.push(result352);

        const result353 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d8a5c3dc0690e6cf1d7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8d925c3dc0690e6cf1d8"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8d9a5c3dc0690e6cf1d9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result353.insertedId}`);
        results.push(result353);

        const result354 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d925c3dc0690e6cf1d8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8dd15c3dc0690e6cf1e2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8dd65c3dc0690e6cf1e3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result354.insertedId}`);
        results.push(result354);

        const result355 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d9a5c3dc0690e6cf1d9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8d9d5c3dc0690e6cf1da"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result355.insertedId}`);
        results.push(result355);

        const result356 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8d9d5c3dc0690e6cf1da"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8da35c3dc0690e6cf1db"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8da95c3dc0690e6cf1dc"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result356.insertedId}`);
        results.push(result356);

        const result357 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8da35c3dc0690e6cf1db"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8dc35c3dc0690e6cf1e0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result357.insertedId}`);
        results.push(result357);

        const result358 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8da95c3dc0690e6cf1dc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8dad5c3dc0690e6cf1dd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result358.insertedId}`);
        results.push(result358);

        const result359 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8dad5c3dc0690e6cf1dd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8db55c3dc0690e6cf1de"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result359.insertedId}`);
        results.push(result359);

        const result360 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8db55c3dc0690e6cf1de"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8db95c3dc0690e6cf1df"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result360.insertedId}`);
        results.push(result360);

        const result361 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8db95c3dc0690e6cf1df"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result361.insertedId}`);
        results.push(result361);

        const result362 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8dc35c3dc0690e6cf1e0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8dc55c3dc0690e6cf1e1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result362.insertedId}`);
        results.push(result362);

        const result363 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8dc55c3dc0690e6cf1e1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result363.insertedId}`);
        results.push(result363);

        const result364 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8dd15c3dc0690e6cf1e2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8df05c3dc0690e6cf1e7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result364.insertedId}`);
        results.push(result364);

        const result365 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8dd65c3dc0690e6cf1e3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8ddc5c3dc0690e6cf1e4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result365.insertedId}`);
        results.push(result365);

        const result366 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8ddc5c3dc0690e6cf1e4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8de25c3dc0690e6cf1e5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result366.insertedId}`);
        results.push(result366);

        const result367 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8de25c3dc0690e6cf1e5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8de75c3dc0690e6cf1e6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result367.insertedId}`);
        results.push(result367);

        const result368 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8de75c3dc0690e6cf1e6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result368.insertedId}`);
        results.push(result368);

        const result369 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8df05c3dc0690e6cf1e7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8df35c3dc0690e6cf1e8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result369.insertedId}`);
        results.push(result369);

        const result370 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8df35c3dc0690e6cf1e8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result370.insertedId}`);
        results.push(result370);

        const result371 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e005c3dc0690e6cf1e9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8e465c3dc0690e6cf1f3"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e4a5c3dc0690e6cf1f4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result371.insertedId}`);
        results.push(result371);

        const result372 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e0f5c3dc0690e6cf1ea"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e165c3dc0690e6cf1eb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result372.insertedId}`);
        results.push(result372);

        const result373 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e165c3dc0690e6cf1eb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fb8e1e5c3dc0690e6cf1ec"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e235c3dc0690e6cf1ed"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result373.insertedId}`);
        results.push(result373);

        const result374 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e1e5c3dc0690e6cf1ec"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e365c3dc0690e6cf1f1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result374.insertedId}`);
        results.push(result374);

        const result375 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e235c3dc0690e6cf1ed"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e265c3dc0690e6cf1ee"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result375.insertedId}`);
        results.push(result375);

        const result376 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e265c3dc0690e6cf1ee"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e2a5c3dc0690e6cf1ef"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result376.insertedId}`);
        results.push(result376);

        const result377 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e2a5c3dc0690e6cf1ef"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e2e5c3dc0690e6cf1f0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result377.insertedId}`);
        results.push(result377);

        const result378 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e2e5c3dc0690e6cf1f0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result378.insertedId}`);
        results.push(result378);

        const result379 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e365c3dc0690e6cf1f1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e395c3dc0690e6cf1f2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result379.insertedId}`);
        results.push(result379);

        const result380 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e395c3dc0690e6cf1f2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result380.insertedId}`);
        results.push(result380);

        const result381 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e465c3dc0690e6cf1f3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e5c5c3dc0690e6cf1f8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result381.insertedId}`);
        results.push(result381);

        const result382 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e4a5c3dc0690e6cf1f4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e4d5c3dc0690e6cf1f5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result382.insertedId}`);
        results.push(result382);

        const result383 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e4d5c3dc0690e6cf1f5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fb8e535c3dc0690e6cf1f6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result383.insertedId}`);
        results.push(result383);

        const result384 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e535c3dc0690e6cf1f6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e555c3dc0690e6cf1f7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result384.insertedId}`);
        results.push(result384);

        const result385 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e555c3dc0690e6cf1f7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result385.insertedId}`);
        results.push(result385);

        const result386 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e5c5c3dc0690e6cf1f8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fb8e5f5c3dc0690e6cf1f9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result386.insertedId}`);
        results.push(result386);

        const result387 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fb8e5f5c3dc0690e6cf1f9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result387.insertedId}`);
        results.push(result387);

        const result388 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbcfe9d1f17f7ead8e7621"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd02bd1f17f7ead8e762b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd02fd1f17f7ead8e762c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result388.insertedId}`);
        results.push(result388);

        const result389 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbcfedd1f17f7ead8e7622"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbcff3d1f17f7ead8e7623"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result389.insertedId}`);
        results.push(result389);

        const result390 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbcff3d1f17f7ead8e7623"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbcff9d1f17f7ead8e7624"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd007d1f17f7ead8e7625"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result390.insertedId}`);
        results.push(result390);

        const result391 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbcff9d1f17f7ead8e7624"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd01bd1f17f7ead8e7629"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result391.insertedId}`);
        results.push(result391);

        const result392 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd007d1f17f7ead8e7625"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd00ad1f17f7ead8e7626"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result392.insertedId}`);
        results.push(result392);

        const result393 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd00ad1f17f7ead8e7626"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd010d1f17f7ead8e7627"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result393.insertedId}`);
        results.push(result393);

        const result394 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd010d1f17f7ead8e7627"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd013d1f17f7ead8e7628"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result394.insertedId}`);
        results.push(result394);

        const result395 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd013d1f17f7ead8e7628"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result395.insertedId}`);
        results.push(result395);

        const result396 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd01bd1f17f7ead8e7629"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd01ed1f17f7ead8e762a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result396.insertedId}`);
        results.push(result396);

        const result397 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd01ed1f17f7ead8e762a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result397.insertedId}`);
        results.push(result397);

        const result398 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd02bd1f17f7ead8e762b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd043d1f17f7ead8e7630"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result398.insertedId}`);
        results.push(result398);

        const result399 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd02fd1f17f7ead8e762c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd031d1f17f7ead8e762d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result399.insertedId}`);
        results.push(result399);

        const result400 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd031d1f17f7ead8e762d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd038d1f17f7ead8e762e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result400.insertedId}`);
        results.push(result400);

        const result401 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd038d1f17f7ead8e762e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd03bd1f17f7ead8e762f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result401.insertedId}`);
        results.push(result401);

        const result402 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd03bd1f17f7ead8e762f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result402.insertedId}`);
        results.push(result402);

        const result403 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd043d1f17f7ead8e7630"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd045d1f17f7ead8e7631"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result403.insertedId}`);
        results.push(result403);

        const result404 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd045d1f17f7ead8e7631"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result404.insertedId}`);
        results.push(result404);

        const result405 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd0ffd1f17f7ead8e7632"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd194d1f17f7ead8e7646"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd19cd1f17f7ead8e7647"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result405.insertedId}`);
        results.push(result405);

        const result406 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd10bd1f17f7ead8e7633"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd110d1f17f7ead8e7634"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result406.insertedId}`);
        results.push(result406);

        const result407 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd110d1f17f7ead8e7634"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd118d1f17f7ead8e7635"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd125d1f17f7ead8e7636"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result407.insertedId}`);
        results.push(result407);

        const result408 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd118d1f17f7ead8e7635"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd164d1f17f7ead8e763f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd169d1f17f7ead8e7640"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result408.insertedId}`);
        results.push(result408);

        const result409 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd125d1f17f7ead8e7636"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd12bd1f17f7ead8e7637"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result409.insertedId}`);
        results.push(result409);

        const result410 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd12bd1f17f7ead8e7637"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd12fd1f17f7ead8e7638"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd133d1f17f7ead8e7639"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result410.insertedId}`);
        results.push(result410);

        const result411 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd12fd1f17f7ead8e7638"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd153d1f17f7ead8e763d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result411.insertedId}`);
        results.push(result411);

        const result412 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd133d1f17f7ead8e7639"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd13fd1f17f7ead8e763a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result412.insertedId}`);
        results.push(result412);

        const result413 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd13fd1f17f7ead8e763a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd146d1f17f7ead8e763b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result413.insertedId}`);
        results.push(result413);

        const result414 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd146d1f17f7ead8e763b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd14ad1f17f7ead8e763c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result414.insertedId}`);
        results.push(result414);

        const result415 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd14ad1f17f7ead8e763c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result415.insertedId}`);
        results.push(result415);

        const result416 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd153d1f17f7ead8e763d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd155d1f17f7ead8e763e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result416.insertedId}`);
        results.push(result416);

        const result417 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd155d1f17f7ead8e763e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result417.insertedId}`);
        results.push(result417);

        const result418 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd164d1f17f7ead8e763f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd180d1f17f7ead8e7644"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result418.insertedId}`);
        results.push(result418);

        const result419 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd169d1f17f7ead8e7640"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd16dd1f17f7ead8e7641"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result419.insertedId}`);
        results.push(result419);

        const result420 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd16dd1f17f7ead8e7641"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd175d1f17f7ead8e7642"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result420.insertedId}`);
        results.push(result420);

        const result421 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd175d1f17f7ead8e7642"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd178d1f17f7ead8e7643"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result421.insertedId}`);
        results.push(result421);

        const result422 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd178d1f17f7ead8e7643"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result422.insertedId}`);
        results.push(result422);

        const result423 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd180d1f17f7ead8e7644"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd182d1f17f7ead8e7645"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result423.insertedId}`);
        results.push(result423);

        const result424 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd182d1f17f7ead8e7645"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result424.insertedId}`);
        results.push(result424);

        const result425 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd194d1f17f7ead8e7646"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd217d1f17f7ead8e765a"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd21ed1f17f7ead8e765b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result425.insertedId}`);
        results.push(result425);

        const result426 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd19cd1f17f7ead8e7647"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1a3d1f17f7ead8e7648"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result426.insertedId}`);
        results.push(result426);

        const result427 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1a3d1f17f7ead8e7648"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd1aad1f17f7ead8e7649"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1b4d1f17f7ead8e764a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result427.insertedId}`);
        results.push(result427);

        const result428 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1aad1f17f7ead8e7649"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd1e7d1f17f7ead8e7653"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1edd1f17f7ead8e7654"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result428.insertedId}`);
        results.push(result428);

        const result429 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1b4d1f17f7ead8e764a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1b7d1f17f7ead8e764b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result429.insertedId}`);
        results.push(result429);

        const result430 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1b7d1f17f7ead8e764b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd1bbd1f17f7ead8e764c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1c2d1f17f7ead8e764d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result430.insertedId}`);
        results.push(result430);

        const result431 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1bbd1f17f7ead8e764c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1dad1f17f7ead8e7651"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result431.insertedId}`);
        results.push(result431);

        const result432 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1c2d1f17f7ead8e764d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1cad1f17f7ead8e764e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result432.insertedId}`);
        results.push(result432);

        const result433 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1cad1f17f7ead8e764e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1cfd1f17f7ead8e764f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result433.insertedId}`);
        results.push(result433);

        const result434 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1cfd1f17f7ead8e764f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1d2d1f17f7ead8e7650"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result434.insertedId}`);
        results.push(result434);

        const result435 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1d2d1f17f7ead8e7650"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result435.insertedId}`);
        results.push(result435);

        const result436 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1dad1f17f7ead8e7651"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1dcd1f17f7ead8e7652"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result436.insertedId}`);
        results.push(result436);

        const result437 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1dcd1f17f7ead8e7652"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result437.insertedId}`);
        results.push(result437);

        const result438 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1e7d1f17f7ead8e7653"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd203d1f17f7ead8e7658"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result438.insertedId}`);
        results.push(result438);

        const result439 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1edd1f17f7ead8e7654"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1f0d1f17f7ead8e7655"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result439.insertedId}`);
        results.push(result439);

        const result440 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1f0d1f17f7ead8e7655"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd1f7d1f17f7ead8e7656"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result440.insertedId}`);
        results.push(result440);

        const result441 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1f7d1f17f7ead8e7656"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd1fad1f17f7ead8e7657"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result441.insertedId}`);
        results.push(result441);

        const result442 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd1fad1f17f7ead8e7657"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result442.insertedId}`);
        results.push(result442);

        const result443 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd203d1f17f7ead8e7658"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd208d1f17f7ead8e7659"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result443.insertedId}`);
        results.push(result443);

        const result444 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd208d1f17f7ead8e7659"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result444.insertedId}`);
        results.push(result444);

        const result445 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd217d1f17f7ead8e765a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd254d1f17f7ead8e7664"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd256d1f17f7ead8e7665"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result445.insertedId}`);
        results.push(result445);

        const result446 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd21ed1f17f7ead8e765b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd222d1f17f7ead8e765c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result446.insertedId}`);
        results.push(result446);

        const result447 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd222d1f17f7ead8e765c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fbd226d1f17f7ead8e765d"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd22cd1f17f7ead8e765e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result447.insertedId}`);
        results.push(result447);

        const result448 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd226d1f17f7ead8e765d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd247d1f17f7ead8e7662"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result448.insertedId}`);
        results.push(result448);

        const result449 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd22cd1f17f7ead8e765e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd237d1f17f7ead8e765f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result449.insertedId}`);
        results.push(result449);

        const result450 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd237d1f17f7ead8e765f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd23cd1f17f7ead8e7660"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result450.insertedId}`);
        results.push(result450);

        const result451 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd23cd1f17f7ead8e7660"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd23fd1f17f7ead8e7661"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result451.insertedId}`);
        results.push(result451);

        const result452 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd23fd1f17f7ead8e7661"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result452.insertedId}`);
        results.push(result452);

        const result453 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd247d1f17f7ead8e7662"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd249d1f17f7ead8e7663"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result453.insertedId}`);
        results.push(result453);

        const result454 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd249d1f17f7ead8e7663"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result454.insertedId}`);
        results.push(result454);

        const result455 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd254d1f17f7ead8e7664"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd274d1f17f7ead8e7669"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result455.insertedId}`);
        results.push(result455);

        const result456 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd256d1f17f7ead8e7665"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd264d1f17f7ead8e7666"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result456.insertedId}`);
        results.push(result456);

        const result457 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd264d1f17f7ead8e7666"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fbd269d1f17f7ead8e7667"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result457.insertedId}`);
        results.push(result457);

        const result458 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd269d1f17f7ead8e7667"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd26cd1f17f7ead8e7668"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result458.insertedId}`);
        results.push(result458);

        const result459 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd26cd1f17f7ead8e7668"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result459.insertedId}`);
        results.push(result459);

        const result460 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd274d1f17f7ead8e7669"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fbd27ad1f17f7ead8e766a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result460.insertedId}`);
        results.push(result460);

        const result461 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fbd27ad1f17f7ead8e766a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result461.insertedId}`);
        results.push(result461);

        const result462 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0af3b290562977865029"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe0b0ab29056297786502a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result462.insertedId}`);
        results.push(result462);

        const result463 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0b0ab29056297786502a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe0b0db29056297786502b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result463.insertedId}`);
        results.push(result463);

        const result464 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0b0db29056297786502b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result464.insertedId}`);
        results.push(result464);

        const result465 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0c88031781a97964c378"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result465.insertedId}`);
        results.push(result465);

        const result466 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0fef031781a97964c39f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe10f3031781a97964c3a9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe10f8031781a97964c3aa"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result466.insertedId}`);
        results.push(result466);

        const result467 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe0ffb031781a97964c3a0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1001031781a97964c3a1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result467.insertedId}`);
        results.push(result467);

        const result468 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1001031781a97964c3a1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1007031781a97964c3a2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe100b031781a97964c3a3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result468.insertedId}`);
        results.push(result468);

        const result469 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1007031781a97964c3a2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe101e031781a97964c3a7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result469.insertedId}`);
        results.push(result469);

        const result470 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe100b031781a97964c3a3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe100e031781a97964c3a4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result470.insertedId}`);
        results.push(result470);

        const result471 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe100e031781a97964c3a4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1012031781a97964c3a5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result471.insertedId}`);
        results.push(result471);

        const result472 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1012031781a97964c3a5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1015031781a97964c3a6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result472.insertedId}`);
        results.push(result472);

        const result473 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1015031781a97964c3a6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result473.insertedId}`);
        results.push(result473);

        const result474 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe101e031781a97964c3a7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1020031781a97964c3a8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result474.insertedId}`);
        results.push(result474);

        const result475 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1020031781a97964c3a8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result475.insertedId}`);
        results.push(result475);

        const result476 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe10f3031781a97964c3a9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe112b031781a97964c3af"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result476.insertedId}`);
        results.push(result476);

        const result477 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe10f8031781a97964c3aa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1108031781a97964c3ab"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result477.insertedId}`);
        results.push(result477);

        const result478 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1108031781a97964c3ab"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1118031781a97964c3ad"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result478.insertedId}`);
        results.push(result478);

        const result479 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1118031781a97964c3ad"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1121031781a97964c3ae"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result479.insertedId}`);
        results.push(result479);

        const result480 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1121031781a97964c3ae"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result480.insertedId}`);
        results.push(result480);

        const result481 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe112b031781a97964c3af"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe112e031781a97964c3b0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result481.insertedId}`);
        results.push(result481);

        const result482 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe112e031781a97964c3b0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result482.insertedId}`);
        results.push(result482);

        const result483 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1222031781a97964c3b1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f553d93fb13cd308e80c"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1232031781a97964c3b2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe123b031781a97964c3b3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result483.insertedId}`);
        results.push(result483);

        const result484 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1232031781a97964c3b2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1430031781a97964c3f1"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe143d031781a97964c3f2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result484.insertedId}`);
        results.push(result484);

        const result485 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe123b031781a97964c3b3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe125a031781a97964c3b4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result485.insertedId}`);
        results.push(result485);

        const result486 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe125a031781a97964c3b4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1260031781a97964c3b5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result486.insertedId}`);
        results.push(result486);

        const result487 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1260031781a97964c3b5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe126b031781a97964c3b6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result487.insertedId}`);
        results.push(result487);

        const result488 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe126b031781a97964c3b6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1276031781a97964c3b7"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe127f031781a97964c3b8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result488.insertedId}`);
        results.push(result488);

        const result489 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1276031781a97964c3b7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1327031781a97964c3cc"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1332031781a97964c3cd"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result489.insertedId}`);
        results.push(result489);

        const result490 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe127f031781a97964c3b8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1289031781a97964c3b9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result490.insertedId}`);
        results.push(result490);

        const result491 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1289031781a97964c3b9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1291031781a97964c3ba"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe129e031781a97964c3bb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result491.insertedId}`);
        results.push(result491);

        const result492 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1291031781a97964c3ba"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe12d5031781a97964c3c4"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe12d7031781a97964c3c5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result492.insertedId}`);
        results.push(result492);

        const result493 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe129e031781a97964c3bb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12a8031781a97964c3bc"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result493.insertedId}`);
        results.push(result493);

        const result494 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12a8031781a97964c3bc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe12ac031781a97964c3bd"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe12b0031781a97964c3be"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result494.insertedId}`);
        results.push(result494);

        const result495 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12ac031781a97964c3bd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe12c5031781a97964c3c2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result495.insertedId}`);
        results.push(result495);

        const result496 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12b0031781a97964c3be"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12b2031781a97964c3bf"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result496.insertedId}`);
        results.push(result496);

        const result497 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12b2031781a97964c3bf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe12b7031781a97964c3c0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result497.insertedId}`);
        results.push(result497);

        const result498 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12b7031781a97964c3c0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12ba031781a97964c3c1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result498.insertedId}`);
        results.push(result498);

        const result499 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12ba031781a97964c3c1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result499.insertedId}`);
        results.push(result499);

        const result500 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12c5031781a97964c3c2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12c8031781a97964c3c3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result500.insertedId}`);
        results.push(result500);

        const result501 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12c8031781a97964c3c3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result501.insertedId}`);
        results.push(result501);

        const result502 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12d5031781a97964c3c4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe130b031781a97964c3ca"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result502.insertedId}`);
        results.push(result502);

        const result503 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12d7031781a97964c3c5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12e5031781a97964c3c7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result503.insertedId}`);
        results.push(result503);

        const result504 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12e5031781a97964c3c7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe12ea031781a97964c3c8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result504.insertedId}`);
        results.push(result504);

        const result505 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12ea031781a97964c3c8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe12ec031781a97964c3c9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result505.insertedId}`);
        results.push(result505);

        const result506 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe12ec031781a97964c3c9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result506.insertedId}`);
        results.push(result506);

        const result507 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe130b031781a97964c3ca"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe130e031781a97964c3cb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result507.insertedId}`);
        results.push(result507);

        const result508 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe130e031781a97964c3cb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result508.insertedId}`);
        results.push(result508);

        const result509 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1327031781a97964c3cc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe139c031781a97964c3e0"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13a6031781a97964c3e1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result509.insertedId}`);
        results.push(result509);

        const result510 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1332031781a97964c3cd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1335031781a97964c3ce"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result510.insertedId}`);
        results.push(result510);

        const result511 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1335031781a97964c3ce"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe133c031781a97964c3cf"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1340031781a97964c3d0"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result511.insertedId}`);
        results.push(result511);

        const result512 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe133c031781a97964c3cf"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1374031781a97964c3d9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe137a031781a97964c3da"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result512.insertedId}`);
        results.push(result512);

        const result513 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1340031781a97964c3d0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1343031781a97964c3d1"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result513.insertedId}`);
        results.push(result513);

        const result514 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1343031781a97964c3d1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1349031781a97964c3d2"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe134c031781a97964c3d3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result514.insertedId}`);
        results.push(result514);

        const result515 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1349031781a97964c3d2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1367031781a97964c3d7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result515.insertedId}`);
        results.push(result515);

        const result516 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe134c031781a97964c3d3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1353031781a97964c3d4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result516.insertedId}`);
        results.push(result516);

        const result517 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1353031781a97964c3d4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe135c031781a97964c3d5"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result517.insertedId}`);
        results.push(result517);

        const result518 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe135c031781a97964c3d5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe135e031781a97964c3d6"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result518.insertedId}`);
        results.push(result518);

        const result519 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe135e031781a97964c3d6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result519.insertedId}`);
        results.push(result519);

        const result520 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1367031781a97964c3d7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1369031781a97964c3d8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result520.insertedId}`);
        results.push(result520);

        const result521 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1369031781a97964c3d8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result521.insertedId}`);
        results.push(result521);

        const result522 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1374031781a97964c3d9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe138b031781a97964c3de"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result522.insertedId}`);
        results.push(result522);

        const result523 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe137a031781a97964c3da"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe137c031781a97964c3db"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result523.insertedId}`);
        results.push(result523);

        const result524 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe137c031781a97964c3db"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1381031781a97964c3dc"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result524.insertedId}`);
        results.push(result524);

        const result525 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1381031781a97964c3dc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1384031781a97964c3dd"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result525.insertedId}`);
        results.push(result525);

        const result526 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1384031781a97964c3dd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result526.insertedId}`);
        results.push(result526);

        const result527 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe138b031781a97964c3de"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe138d031781a97964c3df"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result527.insertedId}`);
        results.push(result527);

        const result528 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe138d031781a97964c3df"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result528.insertedId}`);
        results.push(result528);

        const result529 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe139c031781a97964c3e0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe13d2031781a97964c3ea"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13d6031781a97964c3eb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result529.insertedId}`);
        results.push(result529);

        const result530 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13a6031781a97964c3e1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13ad031781a97964c3e2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result530.insertedId}`);
        results.push(result530);

        const result531 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13ad031781a97964c3e2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe13b1031781a97964c3e3"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13b7031781a97964c3e4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result531.insertedId}`);
        results.push(result531);

        const result532 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13b1031781a97964c3e3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13c7031781a97964c3e8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result532.insertedId}`);
        results.push(result532);

        const result533 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13b7031781a97964c3e4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13b9031781a97964c3e5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result533.insertedId}`);
        results.push(result533);

        const result534 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13b9031781a97964c3e5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13bf031781a97964c3e6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result534.insertedId}`);
        results.push(result534);

        const result535 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13bf031781a97964c3e6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13c1031781a97964c3e7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result535.insertedId}`);
        results.push(result535);

        const result536 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13c1031781a97964c3e7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result536.insertedId}`);
        results.push(result536);

        const result537 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13c7031781a97964c3e8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13c9031781a97964c3e9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result537.insertedId}`);
        results.push(result537);

        const result538 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13c9031781a97964c3e9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result538.insertedId}`);
        results.push(result538);

        const result539 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13d2031781a97964c3ea"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13ea031781a97964c3ef"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result539.insertedId}`);
        results.push(result539);

        const result540 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13d6031781a97964c3eb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13d8031781a97964c3ec"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result540.insertedId}`);
        results.push(result540);

        const result541 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13d8031781a97964c3ec"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe13dd031781a97964c3ed"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result541.insertedId}`);
        results.push(result541);

        const result542 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13dd031781a97964c3ed"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13df031781a97964c3ee"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result542.insertedId}`);
        results.push(result542);

        const result543 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13df031781a97964c3ee"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result543.insertedId}`);
        results.push(result543);

        const result544 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13ea031781a97964c3ef"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe13ec031781a97964c3f0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result544.insertedId}`);
        results.push(result544);

        const result545 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe13ec031781a97964c3f0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result545.insertedId}`);
        results.push(result545);

        const result546 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1430031781a97964c3f1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1642031781a97964c42f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result546.insertedId}`);
        results.push(result546);

        const result547 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe143d031781a97964c3f2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1441031781a97964c3f3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result547.insertedId}`);
        results.push(result547);

        const result548 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1441031781a97964c3f3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14a6031781a97964c3f4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result548.insertedId}`);
        results.push(result548);

        const result549 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14a6031781a97964c3f4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14a9031781a97964c3f5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result549.insertedId}`);
        results.push(result549);

        const result550 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14a9031781a97964c3f5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe14b3031781a97964c3f6"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14bc031781a97964c3f7"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result550.insertedId}`);
        results.push(result550);

        const result551 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14b3031781a97964c3f6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1520031781a97964c40a"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1526031781a97964c40b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result551.insertedId}`);
        results.push(result551);

        const result552 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14bc031781a97964c3f7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14c0031781a97964c3f8"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result552.insertedId}`);
        results.push(result552);

        const result553 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14c0031781a97964c3f8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe14c6031781a97964c3f9"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14cc031781a97964c3fa"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result553.insertedId}`);
        results.push(result553);

        const result554 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14c6031781a97964c3f9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe14f8031781a97964c403"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14fd031781a97964c404"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result554.insertedId}`);
        results.push(result554);

        const result555 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14cc031781a97964c3fa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14ce031781a97964c3fb"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result555.insertedId}`);
        results.push(result555);

        const result556 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14ce031781a97964c3fb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe14d7031781a97964c3fc"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14dc031781a97964c3fd"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result556.insertedId}`);
        results.push(result556);

        const result557 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14d7031781a97964c3fc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14ee031781a97964c401"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result557.insertedId}`);
        results.push(result557);

        const result558 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14dc031781a97964c3fd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14df031781a97964c3fe"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result558.insertedId}`);
        results.push(result558);

        const result559 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14df031781a97964c3fe"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe14e4031781a97964c3ff"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result559.insertedId}`);
        results.push(result559);

        const result560 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14e4031781a97964c3ff"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14e6031781a97964c400"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result560.insertedId}`);
        results.push(result560);

        const result561 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14e6031781a97964c400"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result561.insertedId}`);
        results.push(result561);

        const result562 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14ee031781a97964c401"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14f0031781a97964c402"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result562.insertedId}`);
        results.push(result562);

        const result563 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14f0031781a97964c402"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result563.insertedId}`);
        results.push(result563);

        const result564 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14f8031781a97964c403"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe150f031781a97964c408"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result564.insertedId}`);
        results.push(result564);

        const result565 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14fd031781a97964c404"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe14ff031781a97964c405"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result565.insertedId}`);
        results.push(result565);

        const result566 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe14ff031781a97964c405"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1504031781a97964c406"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result566.insertedId}`);
        results.push(result566);

        const result567 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1504031781a97964c406"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1506031781a97964c407"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result567.insertedId}`);
        results.push(result567);

        const result568 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1506031781a97964c407"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result568.insertedId}`);
        results.push(result568);

        const result569 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe150f031781a97964c408"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1511031781a97964c409"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result569.insertedId}`);
        results.push(result569);

        const result570 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1511031781a97964c409"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result570.insertedId}`);
        results.push(result570);

        const result571 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1520031781a97964c40a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe15bf031781a97964c41e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe15c5031781a97964c41f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result571.insertedId}`);
        results.push(result571);

        const result572 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1526031781a97964c40b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1528031781a97964c40c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result572.insertedId}`);
        results.push(result572);

        const result573 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1528031781a97964c40c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe152b031781a97964c40d"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1531031781a97964c40e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result573.insertedId}`);
        results.push(result573);

        const result574 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe152b031781a97964c40d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe155d031781a97964c417"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe155f031781a97964c418"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result574.insertedId}`);
        results.push(result574);

        const result575 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1531031781a97964c40e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1534031781a97964c40f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result575.insertedId}`);
        results.push(result575);

        const result576 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1534031781a97964c40f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1537031781a97964c410"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe153d031781a97964c411"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result576.insertedId}`);
        results.push(result576);

        const result577 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1537031781a97964c410"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe154f031781a97964c415"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result577.insertedId}`);
        results.push(result577);

        const result578 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe153d031781a97964c411"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1542031781a97964c412"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result578.insertedId}`);
        results.push(result578);

        const result579 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1542031781a97964c412"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1546031781a97964c413"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result579.insertedId}`);
        results.push(result579);

        const result580 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1546031781a97964c413"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1548031781a97964c414"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result580.insertedId}`);
        results.push(result580);

        const result581 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1548031781a97964c414"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result581.insertedId}`);
        results.push(result581);

        const result582 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe154f031781a97964c415"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1551031781a97964c416"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result582.insertedId}`);
        results.push(result582);

        const result583 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1551031781a97964c416"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result583.insertedId}`);
        results.push(result583);

        const result584 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe155d031781a97964c417"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1575031781a97964c41c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result584.insertedId}`);
        results.push(result584);

        const result585 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe155f031781a97964c418"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1561031781a97964c419"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result585.insertedId}`);
        results.push(result585);

        const result586 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1561031781a97964c419"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1566031781a97964c41a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result586.insertedId}`);
        results.push(result586);

        const result587 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1566031781a97964c41a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1569031781a97964c41b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result587.insertedId}`);
        results.push(result587);

        const result588 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1569031781a97964c41b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result588.insertedId}`);
        results.push(result588);

        const result589 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1575031781a97964c41c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1577031781a97964c41d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result589.insertedId}`);
        results.push(result589);

        const result590 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1577031781a97964c41d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result590.insertedId}`);
        results.push(result590);

        const result591 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15bf031781a97964c41e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe15f9031781a97964c428"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1600031781a97964c429"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result591.insertedId}`);
        results.push(result591);

        const result592 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15c5031781a97964c41f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe15cc031781a97964c420"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result592.insertedId}`);
        results.push(result592);

        const result593 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15cc031781a97964c420"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe15d0031781a97964c421"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe15d4031781a97964c422"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result593.insertedId}`);
        results.push(result593);

        const result594 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15d0031781a97964c421"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe15eb031781a97964c426"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result594.insertedId}`);
        results.push(result594);

        const result595 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15d4031781a97964c422"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe15db031781a97964c423"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result595.insertedId}`);
        results.push(result595);

        const result596 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15db031781a97964c423"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe15df031781a97964c424"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result596.insertedId}`);
        results.push(result596);

        const result597 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15df031781a97964c424"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe15e1031781a97964c425"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result597.insertedId}`);
        results.push(result597);

        const result598 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15e1031781a97964c425"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result598.insertedId}`);
        results.push(result598);

        const result599 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15eb031781a97964c426"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe15ee031781a97964c427"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result599.insertedId}`);
        results.push(result599);

        const result600 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15ee031781a97964c427"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result600.insertedId}`);
        results.push(result600);

        const result601 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe15f9031781a97964c428"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1611031781a97964c42d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result601.insertedId}`);
        results.push(result601);

        const result602 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1600031781a97964c429"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1604031781a97964c42a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result602.insertedId}`);
        results.push(result602);

        const result603 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1604031781a97964c42a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe160a031781a97964c42b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result603.insertedId}`);
        results.push(result603);

        const result604 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe160a031781a97964c42b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe160c031781a97964c42c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result604.insertedId}`);
        results.push(result604);

        const result605 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe160c031781a97964c42c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result605.insertedId}`);
        results.push(result605);

        const result606 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1611031781a97964c42d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1613031781a97964c42e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result606.insertedId}`);
        results.push(result606);

        const result607 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1613031781a97964c42e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result607.insertedId}`);
        results.push(result607);

        const result608 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1642031781a97964c42f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1646031781a97964c430"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result608.insertedId}`);
        results.push(result608);

        const result609 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1646031781a97964c430"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1651031781a97964c431"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1657031781a97964c432"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result609.insertedId}`);
        results.push(result609);

        const result610 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1651031781a97964c431"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe16dc031781a97964c445"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16e4031781a97964c446"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result610.insertedId}`);
        results.push(result610);

        const result611 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1657031781a97964c432"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe165b031781a97964c433"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result611.insertedId}`);
        results.push(result611);

        const result612 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe165b031781a97964c433"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1660031781a97964c434"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1665031781a97964c435"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result612.insertedId}`);
        results.push(result612);

        const result613 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1660031781a97964c434"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe16a4031781a97964c43e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16a9031781a97964c43f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result613.insertedId}`);
        results.push(result613);

        const result614 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1665031781a97964c435"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe166c031781a97964c436"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result614.insertedId}`);
        results.push(result614);

        const result615 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe166c031781a97964c436"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1670031781a97964c437"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1674031781a97964c438"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result615.insertedId}`);
        results.push(result615);

        const result616 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1670031781a97964c437"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1693031781a97964c43c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result616.insertedId}`);
        results.push(result616);

        const result617 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1674031781a97964c438"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1684031781a97964c439"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result617.insertedId}`);
        results.push(result617);

        const result618 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1684031781a97964c439"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1689031781a97964c43a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result618.insertedId}`);
        results.push(result618);

        const result619 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1689031781a97964c43a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe168c031781a97964c43b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result619.insertedId}`);
        results.push(result619);

        const result620 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe168c031781a97964c43b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result620.insertedId}`);
        results.push(result620);

        const result621 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1693031781a97964c43c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1696031781a97964c43d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result621.insertedId}`);
        results.push(result621);

        const result622 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1696031781a97964c43d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result622.insertedId}`);
        results.push(result622);

        const result623 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16a4031781a97964c43e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16c9031781a97964c443"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result623.insertedId}`);
        results.push(result623);

        const result624 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16a9031781a97964c43f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16b5031781a97964c440"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result624.insertedId}`);
        results.push(result624);

        const result625 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16b5031781a97964c440"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16bb031781a97964c441"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result625.insertedId}`);
        results.push(result625);

        const result626 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16bb031781a97964c441"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16bc031781a97964c442"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result626.insertedId}`);
        results.push(result626);

        const result627 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16bc031781a97964c442"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result627.insertedId}`);
        results.push(result627);

        const result628 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16c9031781a97964c443"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16cb031781a97964c444"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result628.insertedId}`);
        results.push(result628);

        const result629 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16cb031781a97964c444"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result629.insertedId}`);
        results.push(result629);

        const result630 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16dc031781a97964c445"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1744031781a97964c459"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1749031781a97964c45a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result630.insertedId}`);
        results.push(result630);

        const result631 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16e4031781a97964c446"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16e6031781a97964c447"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result631.insertedId}`);
        results.push(result631);

        const result632 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16e6031781a97964c447"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe16eb031781a97964c448"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16ef031781a97964c449"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result632.insertedId}`);
        results.push(result632);

        const result633 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16eb031781a97964c448"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1719031781a97964c452"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe171f031781a97964c453"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result633.insertedId}`);
        results.push(result633);

        const result634 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16ef031781a97964c449"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16f3031781a97964c44a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result634.insertedId}`);
        results.push(result634);

        const result635 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16f3031781a97964c44a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe16f6031781a97964c44b"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16f9031781a97964c44c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result635.insertedId}`);
        results.push(result635);

        const result636 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16f6031781a97964c44b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe170b031781a97964c450"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result636.insertedId}`);
        results.push(result636);

        const result637 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16f9031781a97964c44c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe16fb031781a97964c44d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result637.insertedId}`);
        results.push(result637);

        const result638 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16fb031781a97964c44d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe16ff031781a97964c44e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result638.insertedId}`);
        results.push(result638);

        const result639 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe16ff031781a97964c44e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1702031781a97964c44f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result639.insertedId}`);
        results.push(result639);

        const result640 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1702031781a97964c44f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result640.insertedId}`);
        results.push(result640);

        const result641 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe170b031781a97964c450"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe170d031781a97964c451"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result641.insertedId}`);
        results.push(result641);

        const result642 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe170d031781a97964c451"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result642.insertedId}`);
        results.push(result642);

        const result643 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1719031781a97964c452"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1732031781a97964c457"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result643.insertedId}`);
        results.push(result643);

        const result644 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe171f031781a97964c453"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1721031781a97964c454"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result644.insertedId}`);
        results.push(result644);

        const result645 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1721031781a97964c454"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1728031781a97964c455"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result645.insertedId}`);
        results.push(result645);

        const result646 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1728031781a97964c455"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe172a031781a97964c456"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result646.insertedId}`);
        results.push(result646);

        const result647 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe172a031781a97964c456"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result647.insertedId}`);
        results.push(result647);

        const result648 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1732031781a97964c457"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1734031781a97964c458"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result648.insertedId}`);
        results.push(result648);

        const result649 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1734031781a97964c458"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result649.insertedId}`);
        results.push(result649);

        const result650 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1744031781a97964c459"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1772031781a97964c463"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1776031781a97964c464"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result650.insertedId}`);
        results.push(result650);

        const result651 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1749031781a97964c45a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe174d031781a97964c45b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result651.insertedId}`);
        results.push(result651);

        const result652 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe174d031781a97964c45b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1750031781a97964c45c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1753031781a97964c45d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result652.insertedId}`);
        results.push(result652);

        const result653 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1750031781a97964c45c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1767031781a97964c461"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result653.insertedId}`);
        results.push(result653);

        const result654 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1753031781a97964c45d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1755031781a97964c45e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result654.insertedId}`);
        results.push(result654);

        const result655 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1755031781a97964c45e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe175b031781a97964c45f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result655.insertedId}`);
        results.push(result655);

        const result656 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe175b031781a97964c45f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe175e031781a97964c460"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result656.insertedId}`);
        results.push(result656);

        const result657 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe175e031781a97964c460"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result657.insertedId}`);
        results.push(result657);

        const result658 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1767031781a97964c461"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1769031781a97964c462"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result658.insertedId}`);
        results.push(result658);

        const result659 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1769031781a97964c462"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result659.insertedId}`);
        results.push(result659);

        const result660 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1772031781a97964c463"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1786031781a97964c468"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result660.insertedId}`);
        results.push(result660);

        const result661 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1776031781a97964c464"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1778031781a97964c465"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result661.insertedId}`);
        results.push(result661);

        const result662 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1778031781a97964c465"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe177c031781a97964c466"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result662.insertedId}`);
        results.push(result662);

        const result663 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe177c031781a97964c466"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe177f031781a97964c467"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result663.insertedId}`);
        results.push(result663);

        const result664 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe177f031781a97964c467"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result664.insertedId}`);
        results.push(result664);

        const result665 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1786031781a97964c468"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1789031781a97964c469"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result665.insertedId}`);
        results.push(result665);

        const result666 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1789031781a97964c469"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result666.insertedId}`);
        results.push(result666);

        const result667 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe193c031781a97964c46a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1940031781a97964c46b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result667.insertedId}`);
        results.push(result667);

        const result668 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1940031781a97964c46b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1948031781a97964c46c"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe194d031781a97964c46d"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result668.insertedId}`);
        results.push(result668);

        const result669 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1948031781a97964c46c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe19cd031781a97964c480"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe19d3031781a97964c481"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result669.insertedId}`);
        results.push(result669);

        const result670 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe194d031781a97964c46d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe194f031781a97964c46e"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result670.insertedId}`);
        results.push(result670);

        const result671 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe194f031781a97964c46e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1954031781a97964c46f"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe195b031781a97964c470"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result671.insertedId}`);
        results.push(result671);

        const result672 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1954031781a97964c46f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe197e031781a97964c479"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1980031781a97964c47a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result672.insertedId}`);
        results.push(result672);

        const result673 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe195b031781a97964c470"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe195f031781a97964c471"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result673.insertedId}`);
        results.push(result673);

        const result674 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe195f031781a97964c471"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1963031781a97964c472"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1967031781a97964c473"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result674.insertedId}`);
        results.push(result674);

        const result675 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1963031781a97964c472"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1977031781a97964c477"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result675.insertedId}`);
        results.push(result675);

        const result676 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1967031781a97964c473"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe196a031781a97964c474"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result676.insertedId}`);
        results.push(result676);

        const result677 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe196a031781a97964c474"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe196e031781a97964c475"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result677.insertedId}`);
        results.push(result677);

        const result678 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe196e031781a97964c475"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1970031781a97964c476"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result678.insertedId}`);
        results.push(result678);

        const result679 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1970031781a97964c476"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result679.insertedId}`);
        results.push(result679);

        const result680 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1977031781a97964c477"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1979031781a97964c478"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result680.insertedId}`);
        results.push(result680);

        const result681 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1979031781a97964c478"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result681.insertedId}`);
        results.push(result681);

        const result682 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe197e031781a97964c479"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1993031781a97964c47e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result682.insertedId}`);
        results.push(result682);

        const result683 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1980031781a97964c47a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1985031781a97964c47b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result683.insertedId}`);
        results.push(result683);

        const result684 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1985031781a97964c47b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1989031781a97964c47c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result684.insertedId}`);
        results.push(result684);

        const result685 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1989031781a97964c47c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe198c031781a97964c47d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result685.insertedId}`);
        results.push(result685);

        const result686 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe198c031781a97964c47d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result686.insertedId}`);
        results.push(result686);

        const result687 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1993031781a97964c47e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1998031781a97964c47f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result687.insertedId}`);
        results.push(result687);

        const result688 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1998031781a97964c47f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result688.insertedId}`);
        results.push(result688);

        const result689 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19cd031781a97964c480"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1a30031781a97964c494"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a39031781a97964c495"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result689.insertedId}`);
        results.push(result689);

        const result690 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19d3031781a97964c481"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe19d5031781a97964c482"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result690.insertedId}`);
        results.push(result690);

        const result691 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19d5031781a97964c482"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe19d9031781a97964c483"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe19dc031781a97964c484"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result691.insertedId}`);
        results.push(result691);

        const result692 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19d9031781a97964c483"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1a08031781a97964c48d"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a0d031781a97964c48e"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result692.insertedId}`);
        results.push(result692);

        const result693 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19dc031781a97964c484"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe19e2031781a97964c485"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result693.insertedId}`);
        results.push(result693);

        const result694 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19e2031781a97964c485"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe19e6031781a97964c486"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe19ea031781a97964c487"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result694.insertedId}`);
        results.push(result694);

        const result695 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19e6031781a97964c486"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe19fc031781a97964c48b"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result695.insertedId}`);
        results.push(result695);

        const result696 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19ea031781a97964c487"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe19ec031781a97964c488"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result696.insertedId}`);
        results.push(result696);

        const result697 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19ec031781a97964c488"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe19f0031781a97964c489"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result697.insertedId}`);
        results.push(result697);

        const result698 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19f0031781a97964c489"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe19f3031781a97964c48a"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result698.insertedId}`);
        results.push(result698);

        const result699 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19f3031781a97964c48a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result699.insertedId}`);
        results.push(result699);

        const result700 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19fc031781a97964c48b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe19fe031781a97964c48c"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result700.insertedId}`);
        results.push(result700);

        const result701 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe19fe031781a97964c48c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result701.insertedId}`);
        results.push(result701);

        const result702 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a08031781a97964c48d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a21031781a97964c492"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result702.insertedId}`);
        results.push(result702);

        const result703 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a0d031781a97964c48e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a13031781a97964c48f"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result703.insertedId}`);
        results.push(result703);

        const result704 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a13031781a97964c48f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a17031781a97964c490"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result704.insertedId}`);
        results.push(result704);

        const result705 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a17031781a97964c490"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a1a031781a97964c491"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result705.insertedId}`);
        results.push(result705);

        const result706 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a1a031781a97964c491"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result706.insertedId}`);
        results.push(result706);

        const result707 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a21031781a97964c492"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a23031781a97964c493"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result707.insertedId}`);
        results.push(result707);

        const result708 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a23031781a97964c493"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result708.insertedId}`);
        results.push(result708);

        const result709 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a30031781a97964c494"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1a5d031781a97964c49e"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a62031781a97964c49f"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result709.insertedId}`);
        results.push(result709);

        const result710 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a39031781a97964c495"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a3e031781a97964c496"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result710.insertedId}`);
        results.push(result710);

        const result711 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a3e031781a97964c496"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1a41031781a97964c497"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a44031781a97964c498"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result711.insertedId}`);
        results.push(result711);

        const result712 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a41031781a97964c497"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a52031781a97964c49c"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result712.insertedId}`);
        results.push(result712);

        const result713 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a44031781a97964c498"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a46031781a97964c499"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result713.insertedId}`);
        results.push(result713);

        const result714 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a46031781a97964c499"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a4a031781a97964c49a"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result714.insertedId}`);
        results.push(result714);

        const result715 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a4a031781a97964c49a"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a4c031781a97964c49b"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result715.insertedId}`);
        results.push(result715);

        const result716 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a4c031781a97964c49b"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result716.insertedId}`);
        results.push(result716);

        const result717 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a52031781a97964c49c"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a54031781a97964c49d"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result717.insertedId}`);
        results.push(result717);

        const result718 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a54031781a97964c49d"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result718.insertedId}`);
        results.push(result718);

        const result719 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a5d031781a97964c49e"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a70031781a97964c4a3"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result719.insertedId}`);
        results.push(result719);

        const result720 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a62031781a97964c49f"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a66031781a97964c4a0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result720.insertedId}`);
        results.push(result720);

        const result721 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a66031781a97964c4a0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a69031781a97964c4a1"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result721.insertedId}`);
        results.push(result721);

        const result722 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a69031781a97964c4a1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a6b031781a97964c4a2"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result722.insertedId}`);
        results.push(result722);

        const result723 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a6b031781a97964c4a2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result723.insertedId}`);
        results.push(result723);

        const result724 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a70031781a97964c4a3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a72031781a97964c4a4"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result724.insertedId}`);
        results.push(result724);

        const result725 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a72031781a97964c4a4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result725.insertedId}`);
        results.push(result725);

        const result726 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a92031781a97964c4a5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1aa5031781a97964c4aa"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result726.insertedId}`);
        results.push(result726);

        const result727 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a95031781a97964c4a6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a97031781a97964c4a7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result727.insertedId}`);
        results.push(result727);

        const result728 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a97031781a97964c4a7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1a9b031781a97964c4a8"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result728.insertedId}`);
        results.push(result728);

        const result729 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a9b031781a97964c4a8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1a9e031781a97964c4a9"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result729.insertedId}`);
        results.push(result729);

        const result730 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1a9e031781a97964c4a9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result730.insertedId}`);
        results.push(result730);

        const result731 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1aa5031781a97964c4aa"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1aa7031781a97964c4ab"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result731.insertedId}`);
        results.push(result731);

        const result732 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1aa7031781a97964c4ab"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result732.insertedId}`);
        results.push(result732);

        const result733 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1ac2031781a97964c4ac"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1ac4031781a97964c4ad"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result733.insertedId}`);
        results.push(result733);

        const result734 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1ac4031781a97964c4ad"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result734.insertedId}`);
        results.push(result734);

        const result735 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1ae0031781a97964c4ae"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1b07031781a97964c4b8"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1b0a031781a97964c4b9"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result735.insertedId}`);
        results.push(result735);

        const result736 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1ae4031781a97964c4af"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1ae9031781a97964c4b0"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result736.insertedId}`);
        results.push(result736);

        const result737 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1ae9031781a97964c4b0"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    children: [
        {
            needed_score: 50,
            question: new mongoDB.ObjectId("67fe1aef031781a97964c4b1"),
            transition: "correct"
        },
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1af1031781a97964c4b2"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result737.insertedId}`);
        results.push(result737);

        const result738 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1aef031781a97964c4b1"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1aff031781a97964c4b6"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result738.insertedId}`);
        results.push(result738);

        const result739 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1af1031781a97964c4b2"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1af4031781a97964c4b3"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result739.insertedId}`);
        results.push(result739);

        const result740 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1af4031781a97964c4b3"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1af7031781a97964c4b4"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result740.insertedId}`);
        results.push(result740);

        const result741 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1af7031781a97964c4b4"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1af9031781a97964c4b5"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result741.insertedId}`);
        results.push(result741);

        const result742 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1af9031781a97964c4b5"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result742.insertedId}`);
        results.push(result742);

        const result743 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1aff031781a97964c4b6"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1b01031781a97964c4b7"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result743.insertedId}`);
        results.push(result743);

        const result744 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b01031781a97964c4b7"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result744.insertedId}`);
        results.push(result744);

        const result745 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b07031781a97964c4b8"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1b17031781a97964c4bd"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result745.insertedId}`);
        results.push(result745);

        const result746 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b0a031781a97964c4b9"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1b0c031781a97964c4ba"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result746.insertedId}`);
        results.push(result746);

        const result747 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b0c031781a97964c4ba"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    children: [
        {
            needed_score: 49,
            question: new mongoDB.ObjectId("67fe1b10031781a97964c4bb"),
            transition: "incorrect"
        }
    ]
});
        console.log(`Document inserted with id: ${result747.insertedId}`);
        results.push(result747);

        const result748 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b10031781a97964c4bb"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1b12031781a97964c4bc"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result748.insertedId}`);
        results.push(result748);

        const result749 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b12031781a97964c4bc"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result749.insertedId}`);
        results.push(result749);

        const result750 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b17031781a97964c4bd"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    children: [
        {
            needed_score: 0,
            question: new mongoDB.ObjectId("67fe1b1a031781a97964c4be"),
            transition: "partial"
        }
    ]
});
        console.log(`Document inserted with id: ${result750.insertedId}`);
        results.push(result750);

        const result751 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67fe1b1a031781a97964c4be"),
    catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
    question: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    children: []
});
        console.log(`Document inserted with id: ${result751.insertedId}`);
        results.push(result751);

        console.log(`All ${results.length} documents inserted successfully`);
    } catch (error) {
        console.error('Error inserting documents:', error);
    }
}

// Execute the function
insertQuestionsInCatalog();
