module.exports = function getExtension(name=''){
    return String(name).substr(name.lastIndexOf('.'), name.length)
}