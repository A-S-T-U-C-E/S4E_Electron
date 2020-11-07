/**
 ******************************************************************************
 * @file    LIS2MDLSensor.cpp
 * @author  SRA
 * @version V1.0.0
 * @date    February 2019
 * @brief   Implementation of an LIS2MDL 3 axes gyroscope sensor.
 ******************************************************************************
 * @attention
 *
 * <h2><center>&copy; COPYRIGHT(c) 2019 STMicroelectronics</center></h2>
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *   2. Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *   3. Neither the name of STMicroelectronics nor the names of its contributors
 *      may be used to endorse or promote products derived from this software
 *      without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 ******************************************************************************
 */


/* Includes ------------------------------------------------------------------*/

#include "LIS2MDLSensor.h"


/* Class Implementation ------------------------------------------------------*/

/** Constructor
 * @param i2c object of an helper class which handles the I2C peripheral
 * @param address the address of the component's instance
 */
LIS2MDLSensor::LIS2MDLSensor(TwoWire *i2c, uint8_t address) : dev_i2c(i2c), address(address)
{
  dev_spi = NULL;
  reg_ctx.write_reg = LIS2MDL_io_write;
  reg_ctx.read_reg = LIS2MDL_io_read;
  reg_ctx.handle = (void *)this;

  /* Enable BDU */
  if (lis2mdl_block_data_update_set(&(reg_ctx), PROPERTY_ENABLE) != LIS2MDL_OK)
  {
    return ;
  }

  /* Operating mode selection - power down */
  if (lis2mdl_operating_mode_set(&(reg_ctx), LIS2MDL_POWER_DOWN) != LIS2MDL_OK)
  {
    return ;
  }

  /* Output data rate selection */
  if (lis2mdl_data_rate_set(&(reg_ctx), LIS2MDL_ODR_100Hz) != LIS2MDL_OK)
  {
    return ;
  }

  /* Self Test disabled. */
  if (lis2mdl_self_test_set(&(reg_ctx), PROPERTY_DISABLE) != LIS2MDL_OK)
  {
    return ;
  }

  mag_is_enabled = 0;

  return;
}

/** Constructor
 * @param spi object of an helper class which handles the SPI peripheral
 * @param cs_pin the chip select pin
 * @param spi_speed the SPI speed
 */
LIS2MDLSensor::LIS2MDLSensor(SPIClass *spi, int cs_pin, uint32_t spi_speed) : dev_spi(spi), cs_pin(cs_pin), spi_speed(spi_speed)
{
  reg_ctx.write_reg = LIS2MDL_io_write;
  reg_ctx.read_reg = LIS2MDL_io_read;
  reg_ctx.handle = (void *)this;

  // Configure CS pin
  pinMode(cs_pin, OUTPUT);
  digitalWrite(cs_pin, HIGH); 
  dev_i2c = NULL;
  address = 0;
  
  uint8_t data = 0x34;

  if (WriteReg(LIS2MDL_CFG_REG_C, data) != LIS2MDL_OK)
  {
    return;
  }

  /* Enable BDU */
  if (lis2mdl_block_data_update_set(&(reg_ctx), PROPERTY_ENABLE) != LIS2MDL_OK)
  {
    return ;
  }

  /* Operating mode selection - power down */
  if (lis2mdl_operating_mode_set(&(reg_ctx), LIS2MDL_POWER_DOWN) != LIS2MDL_OK)
  {
    return ;
  }

  /* Output data rate selection */
  if (lis2mdl_data_rate_set(&(reg_ctx), LIS2MDL_ODR_100Hz) != LIS2MDL_OK)
  {
    return ;
  }

  /* Self Test disabled. */
  if (lis2mdl_self_test_set(&(reg_ctx), PROPERTY_DISABLE) != LIS2MDL_OK)
  {
    return ;
  }

  mag_is_enabled = 0;

  return;
}

/**
 * @brief  Read component ID
 * @param  Id the WHO_AM_I value
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::ReadID(uint8_t *Id)
{
  if (lis2mdl_device_id_get(&reg_ctx, Id) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}


/**
 * @brief Enable the LIS2MDL magnetometer sensor
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::Enable()
{
  /* Check if the component is already enabled */
  if (mag_is_enabled == 1U)
  {
    return LIS2MDL_OK;
  }

  /* Output data rate selection. */
  if (lis2mdl_operating_mode_set(&reg_ctx, LIS2MDL_CONTINUOUS_MODE) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  mag_is_enabled = 1;

  return LIS2MDL_OK;
}

/**
 * @brief Disable the LIS2MDL magnetometer sensor
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::Disable()
{
  /* Check if the component is already disabled */
  if (mag_is_enabled == 0U)
  {
    return LIS2MDL_OK;
  }

  /* Output data rate selection - power down. */
  if (lis2mdl_operating_mode_set(&reg_ctx, LIS2MDL_POWER_DOWN) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  mag_is_enabled = 0;

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL magnetometer sensor sensitivity
 * @param  Sensitivity pointer
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetSensitivity(float *Sensitivity)
{
  *Sensitivity = LIS2MDL_MAG_SENSITIVITY_FS_50GAUSS;

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL magnetometer sensor output data rate
 * @param  Odr pointer where the output data rate is written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetOutputDataRate(float *Odr)
{
  LIS2MDLStatusTypeDef ret = LIS2MDL_OK;
  lis2mdl_odr_t odr_low_level;

  /* Get current output data rate. */
  if (lis2mdl_data_rate_get(&reg_ctx, &odr_low_level) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  switch (odr_low_level)
  {
    case LIS2MDL_ODR_10Hz:
      *Odr = 10.0f;
      break;

    case LIS2MDL_ODR_20Hz:
      *Odr = 20.0f;
      break;

    case LIS2MDL_ODR_50Hz:
      *Odr = 50.0f;
      break;

    case LIS2MDL_ODR_100Hz:
      *Odr = 100.0f;
      break;

    default:
      ret = LIS2MDL_ERROR;
      break;
  }

  return ret;
}

/**
 * @brief  Set the LIS2MDL magnetometer sensor output data rate
 * @param  Odr the output data rate value to be set
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::SetOutputDataRate(float Odr)
{
  lis2mdl_odr_t new_odr;

  new_odr = (Odr <= 10.000f) ? LIS2MDL_ODR_10Hz
            : (Odr <= 20.000f) ? LIS2MDL_ODR_20Hz
            : (Odr <= 50.000f) ? LIS2MDL_ODR_50Hz
            :                    LIS2MDL_ODR_100Hz;

  if (lis2mdl_data_rate_set(&reg_ctx, new_odr) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL magnetometer sensor full scale
 * @param  FullScale pointer where the full scale is written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetFullScale(int32_t *FullScale)
{
  *FullScale = 50;

  return LIS2MDL_OK;
}

/**
 * @brief  Set the LIS2MDL magnetometer sensor full scale
 * @param  FullScale the functional full scale to be set
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::SetFullScale(int32_t FullScale)
{
  (void)FullScale;
  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL magnetometer sensor axes
 * @param  MagneticField pointer where the values of the axes are written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetAxes(int32_t *MagneticField)
{
  axis3bit16_t data_raw;
  float sensitivity;

  /* Read raw data values. */
  if (lis2mdl_magnetic_raw_get(&reg_ctx, data_raw.u8bit) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  /* Get LIS2MDL actual sensitivity. */
  GetSensitivity(&sensitivity);

  /* Calculate the data. */
  MagneticField[0] = (int32_t)((float)((float)data_raw.i16bit[0] * sensitivity));
  MagneticField[1] = (int32_t)((float)((float)data_raw.i16bit[1] * sensitivity));
  MagneticField[2] = (int32_t)((float)((float)data_raw.i16bit[2] * sensitivity));

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL magnetometer sensor raw axes
 * @param  Value pointer where the raw values of the axes are written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetAxesRaw(int16_t *Value)
{
  axis3bit16_t data_raw;

  /* Read raw data values. */
  if (lis2mdl_magnetic_raw_get(&reg_ctx, data_raw.u8bit) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  /* Format the data. */
  Value[0] = data_raw.i16bit[0];
  Value[1] = data_raw.i16bit[1];
  Value[2] = data_raw.i16bit[2];

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL register value for magnetic sensor
 * @param  Reg address to be read
 * @param  Data pointer where the value is written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::ReadReg(uint8_t Reg, uint8_t *Data)
{
  if (lis2mdl_read_reg(&reg_ctx, Reg, Data, 1) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}

/**
 * @brief  Set the LIS2MDL register value for magnetic sensor
 * @param  pObj the device pObj
 * @param  Reg address to be written
 * @param  Data value to be written
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::WriteReg(uint8_t Reg, uint8_t Data)
{
  if (lis2mdl_write_reg(&reg_ctx, Reg, &Data, 1) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}

/**
 * @brief  Set self test
 * @param  val the value of self_test in reg CFG_REG_C
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::SetSelfTest(uint8_t val)
{
  if (lis2mdl_self_test_set(&reg_ctx, val) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}

/**
 * @brief  Get the LIS2MDL MAG data ready bit value
 * @param  pObj the device pObj
 * @param  Status the status of data ready bit
 * @retval 0 in case of success, an error code otherwise
 */
LIS2MDLStatusTypeDef LIS2MDLSensor::GetDRDYStatus(uint8_t *Status)
{
  if (lis2mdl_mag_data_ready_get(&reg_ctx, Status) != LIS2MDL_OK)
  {
    return LIS2MDL_ERROR;
  }

  return LIS2MDL_OK;
}



int32_t LIS2MDL_io_write(void *handle, uint8_t WriteAddr, uint8_t *pBuffer, uint16_t nBytesToWrite)
{
  return ((LIS2MDLSensor *)handle)->IO_Write(pBuffer, WriteAddr, nBytesToWrite);
}

int32_t LIS2MDL_io_read(void *handle, uint8_t ReadAddr, uint8_t *pBuffer, uint16_t nBytesToRead)
{
  return ((LIS2MDLSensor *)handle)->IO_Read(pBuffer, ReadAddr, nBytesToRead);
}
