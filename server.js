const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require('mongodb')
const { time } = require('node:console')
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let db;
const url = 'mongodb+srv://auddls0109_db_user:YReauOUVG4uTtfh7@cluster0.jsrmsuv.mongodb.net/?appName=Cluster0'
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('forum');

    app.listen(8080, () => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })

}).catch((err) => {
    console.log(err)
})

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get('/login',(req, res)=>{
    res.render('login.ejs')
})



app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray()

    응답.render('list.ejs', { 글목록: result })
    // 응답.send('쇼핑페이지임')
})

app.get('/time', (요청, 응답) => {
    let time = new Date();
    응답.render('time.ejs', { time: new Date() })
})

app.get('/write', (요청, 응답) => {
    응답.render('write.ejs')
})

app.post('/add', async (요청, 응답) => {

    try {
        if (요청.body.title == '') {
            응답.send('제목을 입력해주세요.')
        } else {
            await db.collection('post').insertOne({ title: 요청.body.title, content: 요청.body.content })
            응답.redirect('/list')
        }
    } catch (error) {
        console.log(error)
        응답.status(500).send('서버에러남')
    }

})

app.get('/detail/:id', async (요청, 응답) => {


    try {
        let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.id) })
        console.log('상세페이지 입장 ' + result)
        응답.render('detail.ejs', { result: result })

        if (result == null) {
            응답.status(400).send('이상한 url 입력')
        }


    } catch (error) {
        console.log(error)
        응답.status(400).send('이상한 url 입력')
    }

})

app.get('/edit/:id', async (요청, 응답) => {
    let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.id) })
    응답.render('edit.ejs', { result: result })

})

app.put('/edit', async (요청, 응답) => {

    await db.collection('post').updateOne({ _id: 1 },
        { $inc: { like: -2 } }
    )

    await db.collection('post').updateOne(
        { _id: new ObjectId(요청.body.id) },
        { $set: { title: 요청.body.title, content: 요청.body.content } })

    console.log(요청.body)
    응답.redirect('/list')

})

app.delete('/delete', async (요청, 응답) => {
    // db에 있는 document 삭제하기 

    console.log(요청.query)
    await db.collection('post').deleteOne({ _id: new ObjectId(요청.query.docid) })
    console.log('삭제완료~~')
    응답.send('삭제완료~')
})


app.get('/list/:id', async (요청, 응답) => {
    let result = await db.collection('post').find()
    .skip((요청.params.id - 1) * 5).limit(5).toArray()
    응답.render('list.ejs', { 글목록: result })
})

app.get('/list/next/:id', async (요청, 응답) => {
    let result = await db.collection('post')
    .find({_id : {$gt : new ObjectId(요청.params.id) }})
    .limit(5).toArray()
    응답.render('list.ejs', { 글목록: result })
})



