const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

// alustetaan testauksen tietokannan sisältö
beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogList)
})

// testataan että hakeeko get-polku oikean määrän json-muotoista dataa
test('get all blogs in json', async () => {
    const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
    expect(response.body).toHaveLength(helper.initialBlogList.length)
})

// testataan että palautetuilla blogeilla on identifioiva kenttä "id"
test('blogs have an id field', async () => {
    const blogList = await helper.blogsInDb()
    for (const blog of blogList) {
        expect(blog.id).toBeDefined()
    }
})


// testataan että sovellus voi lisätä blogeja
test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Lihava Kissa",
        author: "Kisu",
        url: "localhost",
        likes: 5
    }
    
    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
    const blogListAtEnd = await helper.blogsInDb()  
    expect(blogListAtEnd).toHaveLength(helper.initialBlogList.length + 1)
    const titles = blogListAtEnd.map(b => b.title)
    expect(titles).toContain(
        'Lihava Kissa'
    )
})

// testataan että jos tykkäyksiä ei erikseen anneta, niiden määrä on nolla
test('a blog with no likes specified has zero likes', async () => {
    const newBlog = {
        title: "Lihava Kissa",
        author: "Kisu",
        url: "localhost"
    }
    
    const response = await api.post('/api/blogs').send(newBlog)
    expect(response.body.likes).toBe(0)
    
})

// testataan että vastataanko lisäämiseen ilman kenttää 'title' tai 'url' 400
test('a blog without title or url specified is not added', async () => {
    const newBlog1 = {
        author: "Kisu",
        url: "localhost",
        likes: 5
    }
    const newBlog2 = {
        title: "Lihava Kissa",
        author: "Kisu",
        likes: 5
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400)
  
    const blogListAtEnd = await helper.blogsInDb()
    expect(blogListAtEnd).toHaveLength(helper.initialBlogList.length)
  })

afterAll(async () => {
  await mongoose.connection.close()
})