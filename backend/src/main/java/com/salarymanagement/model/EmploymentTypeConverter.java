package com.salarymanagement.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Stores employment types as their lowercase API values ("full_time", ...). */
@Converter(autoApply = true)
public class EmploymentTypeConverter implements AttributeConverter<EmploymentType, String> {

    @Override
    public String convertToDatabaseColumn(EmploymentType type) {
        return type == null ? null : type.getValue();
    }

    @Override
    public EmploymentType convertToEntityAttribute(String value) {
        return value == null ? null : EmploymentType.fromValue(value);
    }
}
