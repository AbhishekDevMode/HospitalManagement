package com.example.server.security;

import org.jasypt.encryption.StringEncryptor;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Converter
public class CryptoConverter implements AttributeConverter<String, String> {

    private static StringEncryptor encryptor;

    @Autowired
    public void setEncryptor(StringEncryptor encryptor) {
        CryptoConverter.encryptor = encryptor;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        if (encryptor == null) return attribute; // Fallback if Spring hasn't injected yet
        return encryptor.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        if (encryptor == null) return dbData; // Fallback
        try {
            return encryptor.decrypt(dbData);
        } catch (Exception e) {
            return dbData; // Fallback if data was not encrypted
        }
    }
}