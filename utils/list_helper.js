const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let likes = 0
    blogs.forEach(blog => {
        if (blog){
            likes = likes + blog.likes
        }
    });
    return likes
}

const favouriteBlog = (blogs) => {
    let favourite = null
    blogs.forEach(blog => {
        if (favourite && blog){
            if (favourite.likes < blog.likes){
                favourite = blog
            }
        } else {
            favourite = blog
        }
    })
    return favourite
}

const mostBlogs = (blogs) => {
    let mostBlogAuthor = null
    let mostBlogCount = 0
    let bloggersMap = new Map()

    blogs.forEach(blog => {
        let author = blog.author
        if (bloggersMap.has(author)){
            let count = bloggersMap.get(author)
            bloggersMap.set(author, count+1)
        } else {
            bloggersMap.set(author, 1)
        }
    });

    bloggersMap.forEach(function(value, key) {
        if (mostBlogCount < value){
            mostBlogCount = value
            mostBlogAuthor = key
        }
    });

    return { author: mostBlogAuthor, blogs: mostBlogCount }

}

const mostLikes = (blogs) => {
    let mostLikesAuthor = null
    let mostLikesCount = 0
    let bloggersMap = new Map()

    blogs.forEach(blog => {
        let author = blog.author
        let likes = blog.likes
        if (bloggersMap.has(author)){
            let count = bloggersMap.get(author)
            bloggersMap.set(author, count+likes)
        } else {
            bloggersMap.set(author, likes)
        }
    })
    
    bloggersMap.forEach(function(value, key) {
        if (mostLikesCount < value){
            mostLikesCount = value
            mostLikesAuthor = key
        }
    })

    return { author: mostLikesAuthor, likes: mostLikesCount }
}
  
  module.exports = {
    dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}