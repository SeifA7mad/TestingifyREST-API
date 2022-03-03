const operationsNames = {
    post: '',
    get: '',
    put: '',
    delete: ''
}

const replaceAll = (str, mapObj) => {
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

    return str.replace(re, function(matched){
        return mapObj[matched.toLowerCase()];
    });
}

exports.prefixingkey = (keySchema, namePrefix) => {
    if (keySchema.type === 'object' && keySchema.title) {
        return `${keySchema.title}Id`;
    }

    return `${replaceAll(namePrefix, operationsNames)}Id`;
}