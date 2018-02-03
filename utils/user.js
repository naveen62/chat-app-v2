class User {
    constructor() {
        this.users = [];
    }
    addUser(id, group, name) {
        var user = {
            id,
            group,
            name
        }
        this.users.push(user)
        return user
    }
    getUserList(group) {
        var users = this.users.filter((user) => {
            return group == user.group
        })
        var ArrayUsers = users.map((user) => {
            return user.name 
        })
        return ArrayUsers;
    }
    getUser(id) {
        var getUser = this.users.find((user) => {
            return user == id
        })
        return getUser;
    }
    removeUser(id) {
        var returnUser = this.users.find((user) => {
            return user.id == id;
        })
        var removedUser = this.users.filter((user) => {
            return user.id != id;
        })
        this.users = removedUser;
        return returnUser;
    }
}
module.exports = {
    User
}