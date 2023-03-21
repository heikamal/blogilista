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
  
  module.exports = {
    dummy, totalLikes, favouriteBlog
}