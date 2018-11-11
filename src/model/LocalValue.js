class LocalValue {

    constructor(ISO,local,value){
        this._ISO = ISO;
        this._local = local;
        this._value = value;
    }

    get ISO(){
        return this._ISO;
    }

    set ISO(iso){
        this._ISO = iso;
    }

    get local(){
        return this._local;
    }

    set local(local){
        this._local = local;
    }

    get value(){
        return this._value;
    }

    set value(value){
        this._value = value;
    }
}
export default LocalValue;