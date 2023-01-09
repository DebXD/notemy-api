from cryptography.fernet import Fernet

def encryptNote(key, title, content):
    # create a ferent object 
    f = Fernet(key)
    # encrypt note using the object
    enc_title = f.encrypt(title.encode())
    enc_content = f.encrypt(content.encode())
    return enc_title, enc_content

def decryptNote(key, enc_title, enc_content ):
    f = Fernet(key)
    dec_title = f.decrypt(enc_title).decode()
    dec_content = f.decrypt(enc_content).decode()
    return dec_title, dec_content