const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
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

    describe('adding a new blog', () => {
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
    })

    describe('deleting a blog', () => {
        // testataan yksittäisen blogin poistoa
        test('deleting an existing blog should return 204', async () => {
            const blogs = await helper.blogsInDb()
            const toBeDeleted = blogs[0].id
            await api
            .delete(`/api/blogs/${toBeDeleted}`)
            .expect(204)
        })

        // testataan olemattoman blogin poistoa
        test('deleting a non-existing blog should not delete anything', async () => {
            const toBeDeleted = await helper.nonExistingId()
            await api.delete(`/api/blogs/${toBeDeleted}`)

            const blogsList = await helper.blogsInDb()
            expect(blogsList.length).toBe(helper.initialBlogList.length)
        })
    })

    describe('updating a blog', () => {

        test('increasing likes by one', async () => {
            const blogsList = await helper.blogsInDb()
            const toBeUpdated = blogsList[0]

            const updatedBlog = {
                likes: toBeUpdated.likes + 1
            }

            const response = await api
            .put(`/api/blogs/${toBeUpdated.id}`)
            .send(updatedBlog)
            .expect(200)

            expect(response.body.likes).toBe(toBeUpdated.likes + 1)
        })

        test('trying to give string in likes returns 400 validationerror', async () => {
            const blogsList = await helper.blogsInDb()
            const toBeUpdated = blogsList[0]

            const updatedBlog = {
                likes: 'pöö'
            }

            const response = await api
            .put(`/api/blogs/${toBeUpdated.id}`)
            .send(updatedBlog)
            .expect(400)
        })

        test('updating a non-existing blog should return no content', async () => {
            const toBeUpdated = await helper.nonExistingId()
            const updatedBlog = {
                likes: 200
            }

            const response = await api
            .put(`/api/blogs/${toBeUpdated}`)
            .send(updatedBlog)
            
            expect(response.body).toBe(null)
        })
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ name: 'admin' ,username: 'root', passwordHash })
  
      await user.save()
    })

    test('get to /api/users/ should return all the users in db', async () => {
        const response = await api
        .get('/api/users/')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const userList = response.body

        const userListDb = await helper.usersInDb()

        expect(userList).toEqual(userListDb)
    
    })

    describe('creating a new user', () => {
        test('creation succeeds with a unique username', async () => {
            const usersAtStart = await helper.usersInDb()
        
            const newUser = {
              name: 'Heikki Malkavaara',
              username: 'heimal',
              password: 'salasana123',
            }
        
            await api
              .post('/api/users')
              .send(newUser)
              .expect(201)
              .expect('Content-Type', /application\/json/)
        
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
        
            const usernames = usersAtEnd.map(u => u.username)
            expect(usernames).toContain(newUser.username)
        })
      
        test('creation fails with an existing username with proper status and error', async () => {
            const newUser = {
                name: 'admin',
                username: 'root',
                password: 'sekret',
            }
      
            const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('expected `username` to be unique')
        })
    
        test('creation fails when username is less than 3 characters with proper status and error', async () => {
            const newUser = {
                name: 'Heikki Malkavaara',
                username: 'hm',
                password: 'salasana123',
            }
    
            const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('shorter than the minimum allowed length (3)')
        })
    
        test('creation fails when password is less than 3 characters with proper status and error', async () => {
            const newUser = {
                name: 'Heikki Malkavaara',
                username: 'heimal',
                password: 's',
            }
    
            const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('password missing or too short')
        })
    })
})

afterAll(async () => {
  await mongoose.connection.close()
})