export const validateLastVersionFilter = (data: any) => {
    for (let i = 1; i < data.length; i += 1) {
        if (data[i].modified) {
            if ((new Date(data[i].modified) < new Date(data[i - 1].modified)) || (data[i].id === data[i - 1].id)) {
                return false;
            }
        }
    }
    return true;
}

export const validateFirstVersionFilter = (data: any) => {
    for (let i = 1; i < data.length; i += 1) {
        if (data[i].modified) {
            if ((new Date(data[i].modified) > new Date(data[i - 1].modified)) || (data[i].id === data[i - 1].id)) {
                return false;
            }
        }
    }
    return true;
}
