# LSM6DSOX
Arduino library to support the LSM6DSOX 3D accelerometer and 3D gyroscope

## API

This sensor uses I2C or SPI to communicate.
For I2C it is then required to create a TwoWire interface before accessing to the sensors:  

    dev_i2c = new TwoWire(I2C_SDA, I2C_SCL);  
    dev_i2c->begin();

For SPI it is then required to create a SPI interface before accessing to the sensors:  

    dev_spi = new SPIClass(SPI_MOSI, SPI_MISO, SPI_SCK);  
    dev_spi->begin();

An instance can be created and enbaled when the I2C bus is used following the procedure below:  

    AccGyr = new LSM6DSOXSensor(dev_i2c);  
    AccGyr->Enable_X();  
    AccGyr->Enable_G();

An instance can be created and enbaled when the SPI bus is used following the procedure below:  

    AccGyr = new LSM6DSOXSensor(dev_spi, CS_PIN);  
    AccGyr->Enable_X();  
    AccGyr->Enable_G();

The access to the sensor values is done as explained below:  

  Read accelerometer and gyroscope.

    AccGyr->Get_X_Axes(accelerometer);  
    AccGyr->Get_G_Axes(gyroscope);

## Documentation

You can find the source files at  
https://github.com/stm32duino/LSM6DSOX

The LSM6DSOX datasheet is available at  
https://www.st.com/content/st_com/en/products/mems-and-sensors/inemo-inertial-modules/lsm6dsox.html
