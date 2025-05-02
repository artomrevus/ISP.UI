// connections.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FullInternetConnectionRequest, InternetConnectionRequestDto } from '../../../models/isp/internet-connection-request.models';
import { InternetConnectionRequestsService } from '../../../services/isp/internet-connection-requests.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { InternetConnectionRequestStatusesService } from '../../../services/isp/internet-connection-request-statuses.service';
import { FullInternetConnectionRequestStatus, InternetConnectionRequestStatusDto } from '../../../models/isp/internet-connection-request-status.models';
import { AddConnectionDto, ConnectionDto } from '../../../models/isp/connection.models';
import { FullConnectionTariff } from '../../../models/isp/connection-tariff.models';
import { AddConnectionEquipmentDto, ConnectionEquipmentDto, FullConnectionEquipment } from '../../../models/isp/connection-equipment.models';
import { FullOfficeEquipment } from '../../../models/isp/office-equipment.models';
import { MatListModule } from '@angular/material/list'; 
import { ConnectionTariffsService } from '../../../services/isp/connection-tariffs.service';
import { AuthEmployeeService } from '../../../services/auth/auth-employee.service';
import { EmployeesService } from '../../../services/isp/employees.service';
import { OfficeEquipmentsService } from '../../../services/isp/office-equipments.service';
import { ConnectionsService } from '../../../services/isp/connections.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IcrsFilterPanelComponent } from '../icrs-filter-panel/icrs-filter-panel.component';
import { ConnectionEquipmentsService } from '../../../services/isp/connection-equipments.service';
import { Router } from '@angular/router';
import { EmployeeDto } from '../../../models/isp/employee.models';
import { InternetTariffsService } from '../../../services/isp/internet-tariffs.service';
import { ClientStatusesService } from '../../../services/isp/client-statuses.service';
import { LocationTypesService } from '../../../services/isp/location-types.service';
import { CitiesService } from '../../../services/isp/cities.service';
import { FullInternetTariff } from '../../../models/isp/internet-tariff.models';
import { InternetTariffStatusDto } from '../../../models/isp/internet-tariff-status.models';
import { ClientStatusDto } from '../../../models/isp/client-status.models';
import { LocationTypeDto } from '../../../models/isp/location-type.models';
import { CityDto } from '../../../models/isp/city.models';
import { InternetTariffStatusesService } from '../../../services/isp/internet-tariff-statuses.service';
import { ConnectionDialogComponent } from '../create-connection-dialog/connection-dialog.component';
import { PaginationParameters } from '../../../models/isp/pagination.models';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';
import { NetworkTechnicianHeaderComponent } from '../../network-technician/network-technician-header/network-technician-header.component';

@Component({
  selector: 'app-connection-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    IcrsFilterPanelComponent,
    NetworkTechnicianHeaderComponent
  ],
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.css']
})
export class ConnectionListComponent implements OnInit {

  // Data
  pageIcrs: FullInternetConnectionRequest[] = [];
  totalIcrs = 0;
  isIcrsLoading = false;

  // Additional data
  icrStatuses: FullInternetConnectionRequestStatus[] = [];
  activeConnectionTariffs: FullConnectionTariff[] = [];
  officeEquipments: FullOfficeEquipment[] = [];


  // Filters data
  internetTariffs: FullInternetTariff[] = [];
  internetTariffStatuses: InternetTariffStatusDto[] = [];
  requestStatuses: InternetConnectionRequestStatusDto[] = [];
  clientStatuses: ClientStatusDto[] = [];
  locationTypes: LocationTypeDto[] = [];
  cities: CityDto[] = [];

  // Filters
  currentFilters: any = {
    filters: {
      internetTariffIds: [],
      internetTariffStatusIds: [],
      internetConnectionRequestStatusIds: [],
      clientStatusIds: [],
      locationTypeIds: [],
      cityIds: [],
      numberContains: null,
      requestDateFrom: null,
      requestDateTo: null
    },
    sorting: {
      sortBy: 'requestDate',
      ascending: false
    }
  };

  paginationParameters: PaginationParameters = { 
    pageNumber: 1,
    pageSize: 10 
  };

  connectionEmployeeId?: number;
  isFilterPanelVisible: boolean = false;

  constructor(
    private icrsService: InternetConnectionRequestsService,
    private icrStatusesService: InternetConnectionRequestStatusesService,
    private connectionTariffsService: ConnectionTariffsService,
    private authEmployeeService: AuthEmployeeService,
    private employeesService: EmployeesService,
    private officeEquipmentsService: OfficeEquipmentsService,
    private connectionsService: ConnectionsService,
    private connectionEquipmentsService: ConnectionEquipmentsService,
    private internetTariffsService: InternetTariffsService,
    private clientStatusesService: ClientStatusesService,
    private locationTypesService: LocationTypesService,
    private citiesServise: CitiesService,
    private internetTariffStatusesService: InternetTariffStatusesService,
    private monitoringService: MonitoringService,
    private dialog: MatDialog,
    private router: Router
  ) { }


  // ---------------------------------
  // 
  // Component initialization methods
  //
  // ---------------------------------


  ngOnInit(): void {
    this.loadIcrs();
    this.loadIcrsCount();
    this.loadAdditionalData();
    this.loadFiltersData();
  }

  // Loading page internet connection requests
  async loadIcrs(): Promise<void> {
    this.isIcrsLoading = true;
    try {
      // Get all internet connection requests
      const params = this.prepareRequestParams();
      this.pageIcrs = await this.icrsService.getFull(params)

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Запити на підключення',
        action: 'Отримання',
        details: this.formatGetActivityDetails(params)
      };
      await firstValueFrom(this.monitoringService.logActivity(activity));
    }
    catch (error) {
      console.error('Error loading internet connection requests.', error);
    }
    finally{
      this.isIcrsLoading = false;
    }
  }

  // Load internet connection requests count
  async loadIcrsCount(): Promise<void>{
    try {
      const params = this.prepareRequestParams();
      this.totalIcrs = await firstValueFrom(this.icrsService.getCount(params));
    }
    catch (error) {
      console.error('Error loading internet connection requests count.', error);
    }
  }

  // Load additional data
  async loadAdditionalData(): Promise<void>{
    try {
      this.icrStatuses = await this.icrStatusesService.get();

      this.activeConnectionTariffs = await this.connectionTariffsService.getActive();

      const employee = await this.getLoginedEmployee()
      this.officeEquipments = await this.officeEquipmentsService.getByOfficeFull(employee.officeId);
    }
    catch (error) {
      console.error('Error loading additional data.', error);
    }
  }

  // Load filters data
  async loadFiltersData() {
    this.internetTariffs = await this.internetTariffsService.getFull();

    forkJoin({
      internetTariffStatuses: this.internetTariffStatusesService.get(),
      requestStatuses: this.icrStatusesService.get(),
      clientStatuses: this.clientStatusesService.get(),
      locationTypes: this.locationTypesService.get(),
      cities: this.citiesServise.get()
    }).subscribe(results => {
      this.internetTariffStatuses = results.internetTariffStatuses;
      this.requestStatuses = results.requestStatuses;
      this.clientStatuses = results.clientStatuses;
      this.locationTypes = results.locationTypes;
      this.cities = results.cities;
    });
  }

  
  // -----------------------------------------
  // 
  // Filtering, sorting and pagination methods
  //
  // -----------------------------------------


  onFiltersChanged(filterData: any) {
    this.currentFilters = filterData;
    this.paginationParameters.pageNumber = 1;
    this.loadIcrs();
    this.loadIcrsCount();
  }
  
  prepareRequestParams(): any {
    const params: any = {
      pageNumber: this.paginationParameters.pageNumber,
      pageSize: this.paginationParameters.pageSize,
      sortBy: this.currentFilters.sorting.sortBy,
      ascending: this.currentFilters.sorting.ascending
    };
    
    const filters = this.currentFilters.filters;
    
    if (this.connectionEmployeeId) {
      params.connectionEmployeeIds = [this.connectionEmployeeId];
    }

    if (filters.internetTariffIds.length > 0) {
      params.internetTariffIds = filters.internetTariffIds;
    }

    if (filters.internetTariffStatusIds.length > 0) {
      params.internetTariffStatusIds = filters.internetTariffStatusIds;
    }

    if (filters.internetConnectionRequestStatusIds.length > 0) {
      params.internetConnectionRequestStatusIds = filters.internetConnectionRequestStatusIds;
    }
    
    if (filters.clientStatusIds.length > 0) {
      params.clientStatusIds = filters.clientStatusIds;
    }
    
    if (filters.locationTypeIds.length > 0) {
      params.locationTypeIds = filters.locationTypeIds;
    }
    
    if (filters.cityIds.length > 0) {
      params.cityIds = filters.cityIds;
    }
    
    if (filters.numberContains) {
      params.numberContains = filters.numberContains;
    }
    
    if (filters.requestDateFrom) {
      params.requestDateFrom = `${filters.requestDateFrom.year}-${filters.requestDateFrom.month}-${filters.requestDateFrom.day}`;
    }
    
    if (filters.requestDateTo) {
      params.requestDateTo = `${filters.requestDateTo.year}-${filters.requestDateTo.month}-${filters.requestDateTo.day}`;
    }
    
    return params;
  }

  onPageChange(event: PageEvent): void {
    this.paginationParameters = {
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize
    };
    this.loadIcrs();
  }

  toggleFilterPanel() {
    this.isFilterPanelVisible = !this.isFilterPanelVisible;
  }

  async toggleFilterByEmployee() {
    if(this.connectionEmployeeId){
      this.connectionEmployeeId = undefined;
    } else {
      const employee = await this.getLoginedEmployee();
      this.connectionEmployeeId = employee.id;
    }

    this.paginationParameters.pageNumber = 1;
    this.loadIcrs();
    this.loadIcrsCount();
  }


  // --------------------------------------------
  // 
  // Internet connection request statuses methods
  //
  // --------------------------------------------

  async setIcrStatus(icr: FullInternetConnectionRequest, statusName: string): Promise<void> {
    try {
      const newIcrStatus = this.icrStatuses.find(x => x.internetConnectionRequestStatusName === statusName);
      
      if(!newIcrStatus){
        throw new Error('Internet connection request not found.');
      }
    
      icr.internetConnectionRequestStatusId = newIcrStatus.id;
      const icrDto: InternetConnectionRequestDto = icr;

      await firstValueFrom(this.icrsService.update(icrDto));
      icr.internetConnectionRequestStatus = newIcrStatus;

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Запити на підключення',
        action: 'Оновлення статусу',
        details: this.formatUpdateStatusActivityDetails(icr)
      };
      await firstValueFrom(this.monitoringService.logActivity(activity));
    }
    catch (error) {
      alert('Error updating internet connection request.');
      console.error('Error updating internet connection request.', error);
    }
  }


  isIcrStatus(icr: FullInternetConnectionRequest, statusName: string): boolean{
    return icr.internetConnectionRequestStatus.internetConnectionRequestStatusName === statusName;
  }


  // -------------------------
  // 
  // Connection create methods
  //
  // -------------------------


  openCreateConnectionDialog(icr: any): void {
    const dialogRef = this.dialog.open(ConnectionDialogComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'connection-dialog-panel',
      data: {
        title: "Створити підключення",
        icr: icr,
        activeConnectionTariffs: this.activeConnectionTariffs,
        officeEquipments: this.officeEquipments
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createConnection(icr, result);
      }
    });
  }

  async createConnection(icr: FullInternetConnectionRequest, connectionData: any): Promise<void> {
    // Checks
    const savedLogin = this.authEmployeeService.getLogin();
    if(!savedLogin){
      this.router.navigateByUrl('/network-technician/login');
      return;
    }

    try {
      await this.ensureOfficeEquipmentEnough_Create(connectionData.connectionEquipments);
    } catch (error) {
      alert(error);
      return;
    }

    // Create new connection
    const newConnection: AddConnectionDto = {
      internetConnectionRequestId: icr.id,
      connectionTariffId: connectionData.connectionTariffId,
      connectionDate: this.formatDate(connectionData.connectionDate),
      employeeId: +savedLogin.employeeId,
      totalPrice: connectionData.totalPrice
    }

    const createdConnection = await firstValueFrom(this.connectionsService.create(newConnection));
    console.log('Created conntection:', createdConnection)

    // Create connection equipments
    for(const connectionEquipmentData of connectionData.connectionEquipments){
      const newConnectionEquipment: AddConnectionEquipmentDto = {
        connectionId: createdConnection.id,
        officeEquipmentId: connectionEquipmentData.officeEquipmentId,
        connectionEquipmentAmount: connectionEquipmentData.connectionEquipmentAmount
      }

      const createdConnectionEquipment = await firstValueFrom(this.connectionEquipmentsService.create(newConnectionEquipment));
      console.log('Created conntection equipment:', createdConnectionEquipment)
    }

    // Load created connection
    icr.connection = await this.connectionsService.getByIcrIdFull(icr.id);

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Запити на підключення',
      action: 'Створення підключення',
      details: this.formatCreateConnectionActivityDetails(icr)
    };
    await firstValueFrom(this.monitoringService.logActivity(activity));
  }

  async ensureOfficeEquipmentEnough_Create(connectionEquipments: any): Promise<void> {
    for(const connectionEquipment of connectionEquipments){
      const officeEquipment = await this.officeEquipmentsService.getByIdFull(connectionEquipment.officeEquipmentId);
      if(connectionEquipment.connectionEquipmentAmount > officeEquipment.officeEquipmentAmount){
        throw new Error(
          "Обладнання '" + officeEquipment.equipment.name + "' недостатньо на складі. Зверніться до менеджера вашого офісу для замовлення необхідного обладнання. Наразі в наявності " + officeEquipment.officeEquipmentAmount + ' од.');
      }
    }
  }


  // ---------------------------------
  // 
  // Connection update methods
  //
  // ---------------------------------


  openEditConnectionDialog(icr: FullInternetConnectionRequest): void {
    const dialogRef = this.dialog.open(ConnectionDialogComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'connection-dialog-panel',
      data: {
        title: "Редагувати підключення",
        icr: icr,
        activeConnectionTariffs: this.activeConnectionTariffs,
        officeEquipments: this.officeEquipments
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editConnection(icr, result);
      }
    });
  }

  async editConnection( icr: FullInternetConnectionRequest, connectionData: any ): Promise<void> {
    // Checks
    const savedLogin = this.authEmployeeService.getLogin();
    if( !savedLogin ){
      this.router.navigateByUrl( '/network-technician/login' );
      return;
    }

    if( !icr.connection ){
      alert('Щось пішло не так.');
      return;
    }

    try {
      await this.ensureOfficeEquipmentEnough_Update( icr.connection.connectionEquipments, connectionData.connectionEquipments );
    } catch ( error ) {
      alert( error );
      return;
    }

    // Update connection
    const updateConnectionDto: ConnectionDto = {
      id: icr.connection.id,
      internetConnectionRequestId: icr.id,
      connectionTariffId: connectionData.connectionTariffId,
      connectionDate: this.formatDate(connectionData.connectionDate),
      employeeId: +savedLogin.employeeId,
      totalPrice: connectionData.totalPrice
    }

    await this.updateConnection( updateConnectionDto );

    // Updating connection equipments
    await this.updateConnectionEquipment( icr.connection.id,  icr.connection.connectionEquipments, connectionData.connectionEquipments );

    // Load created connection
    icr.connection = await this.connectionsService.getByIcrIdFull( icr.id );

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Запити на підключення',
      action: 'Оновлення підключення',
      details: this.formatUpdateConnectionActivityDetails(icr)
    };
    await firstValueFrom(this.monitoringService.logActivity(activity));
  }

  async updateConnection(dto: ConnectionDto): Promise<void> {
    const updatedConnection = await firstValueFrom(this.connectionsService.update(dto));
    console.log('Updated connection:', updatedConnection)
  }

  async updateConnectionEquipment(
    connectionId: number,
    currentConnectionEquipments: FullConnectionEquipment[],
    formConnectionEquipments: any
  ): Promise<void> {
    const currentOfficeEquipmentIdsSet = new Set( currentConnectionEquipments.map( x => x.officeEquipmentId) );
    const formOfficeEquipmentIdsSet = new Set( formConnectionEquipments.map((x: { officeEquipmentId: number; }) => x.officeEquipmentId) );

    const connectionEquipmentToAdd = formConnectionEquipments.filter(
      (x: { officeEquipmentId: number; }) => !currentOfficeEquipmentIdsSet.has(x.officeEquipmentId)
    );

    const connectionEquipmentToUpdate = formConnectionEquipments.filter(
      (x: { officeEquipmentId: number; }) => currentOfficeEquipmentIdsSet.has(x.officeEquipmentId)
    );

    const connectionEquipmentToRemove = currentConnectionEquipments.filter(
      x => !formOfficeEquipmentIdsSet.has(x.officeEquipmentId)
    );

    for( const connectionEquipment of connectionEquipmentToAdd ){
      const createDto: AddConnectionEquipmentDto = {
        connectionId: connectionId,
        officeEquipmentId: connectionEquipment.officeEquipmentId,
        connectionEquipmentAmount: connectionEquipment.connectionEquipmentAmount
      }

      await firstValueFrom( this.connectionEquipmentsService.create(createDto) );
    }

    for( const connectionEquipment of connectionEquipmentToUpdate ){
      const currentConnectionEquipment = currentConnectionEquipments.find(
        x => x.officeEquipmentId === connectionEquipment.officeEquipmentId
      );
      
      if( !currentConnectionEquipment ){
        alert('Щось пішло не так.');
        return;
      }

      if( currentConnectionEquipment.connectionEquipmentAmount === connectionEquipment.connectionEquipmentAmount ){
        continue;
      }

      const updateDto: ConnectionEquipmentDto = {
        id: currentConnectionEquipment.id,
        connectionId: connectionId,
        officeEquipmentId: connectionEquipment.officeEquipmentId,
        connectionEquipmentAmount: connectionEquipment.connectionEquipmentAmount
      }

      await firstValueFrom( this.connectionEquipmentsService.update(updateDto) );
    }

    for( const connectionEquipment of connectionEquipmentToRemove ){
      await firstValueFrom( this.connectionEquipmentsService.delete(connectionEquipment.id) );
    }
  }

  async ensureOfficeEquipmentEnough_Update(
    currentConnectionEquipments: FullConnectionEquipment[],
    formConnectionEquipments: any,

  ) : Promise<void> {

    const currentOfficeEquipmentIdsSet = new Set( currentConnectionEquipments.map( x => x.officeEquipmentId) );

    const connectionEquipmentToAdd = formConnectionEquipments.filter(
      (x: { officeEquipmentId: number; }) => !currentOfficeEquipmentIdsSet.has(x.officeEquipmentId)
    );

    const connectionEquipmentToUpdate = formConnectionEquipments.filter(
      (x: { officeEquipmentId: number; }) => currentOfficeEquipmentIdsSet.has(x.officeEquipmentId)
    );

    await this.ensureOfficeEquipmentEnough_Create(connectionEquipmentToAdd);

    for(const connectionEquipment of connectionEquipmentToUpdate){
      const currentConnectionEquipment = currentConnectionEquipments.find(
        x => x.officeEquipmentId === connectionEquipment.officeEquipmentId
      );
      
      if( !currentConnectionEquipment ){
        alert('Щось пішло не так.');
        return;
      }

      const addAmount = connectionEquipment.connectionEquipmentAmount - currentConnectionEquipment.connectionEquipmentAmount;
      
      const officeEquipment = await this.officeEquipmentsService.getByIdFull(connectionEquipment.officeEquipmentId);
      
      if(addAmount > officeEquipment.officeEquipmentAmount){
        throw new Error(
          `Обладнання ${officeEquipment.equipment.name} недостатньо на складі. Зверніться до менеджера вашого офісу для замовлення необхідного обладнання. Наразі в наявності ${officeEquipment.officeEquipmentAmount} од.`);
      }
    }
  }


  // ---------------------------------
  // 
  // Helpers methods
  //
  // ---------------------------------


  calculateEquipmentTotal(equipments: any[]): number {
    if (!equipments || !Array.isArray(equipments)) {
      return 0;
    }
    
    return equipments.reduce((total, item) => {
      return total + (item.connectionEquipmentAmount * item.officeEquipment.equipment.price);
    }, 0);
  }


  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  async getLoginedEmployee(): Promise<EmployeeDto>{

    const savedLogin = this.authEmployeeService.getLogin();

    if(!savedLogin){
      this.router.navigateByUrl('/network-technician/login');
      throw new Error('Login data is outdated or corrupted.');
    }

    return firstValueFrom(this.employeesService.getById(+savedLogin.employeeId));
  }


  // ---------------------------------
  // 
  // Monitoring methods
  //
  // ---------------------------------


  formatGetActivityDetails(params: any): string {
    let details = '';
    details += `Номер сторінки: ${params.pageNumber}.\nРозмір сторінки: ${params.pageSize}.\n`
    details += `Сортування по: ${this.getSortingName(params.sortBy)}.\nСортування за: ${(params.ascending ? 'Зростанням' : 'Спаданням')}.\n`
    if (Object.keys(params).length === 4) {
      return details;
    }
    details += 'Параметри фільтрації:\n'

    // Employee details
    if (this.connectionEmployeeId) {
      details += `Тільки "Mої підключення".\n`;
    }

    // Internet tariffs details
    if (params.internetTariffIds && params.internetTariffIds.length > 0) {
      const internetTariffNames = params.internetTariffIds.map((id: number) => {
        const internetTariff = this.internetTariffs.find(x => x.id === id);
        return `${internetTariff?.name} (${internetTariff?.locationType.locationTypeName})`;
      });

      details += `Інтернет тарифи: ${internetTariffNames.join(', ')}.\n`;
    }

    // Internet tariff statuses details
    if (params.internetTariffStatusIds && params.internetTariffStatusIds.length > 0) {
      const internetTariffStatusNames = params.internetTariffStatusIds.map((id: number) => {
        const internetTariffStatus = this.internetTariffStatuses.find(c => c.id === id);
        return `${internetTariffStatus?.internetTariffStatusName}`;
      });

      details += `Статуси інтернет тарифів: ${internetTariffStatusNames.join(', ')}.\n`;
    }

    // Icr statuses details
    if (params.internetConnectionRequestStatusIds && params.internetConnectionRequestStatusIds.length > 0) {
      const icrStatusNames = params.internetConnectionRequestStatusIds.map((id: number) => {
        const icrStatus = this.icrStatuses.find(c => c.id === id);
        return `${icrStatus?.internetConnectionRequestStatusName}`;
      });

      details += `Статуси запитів: ${icrStatusNames.join(', ')}.\n`;
    }

    // Client statuses details
    if (params.clientStatusIds && params.clientStatusIds.length > 0) {
      const clientStatusNames = params.clientStatusIds.map((id: number) => {
        const clientStatus = this.clientStatuses.find(c => c.id === id);
        return `${clientStatus?.clientStatusName}`;
      });

      details += `Статуси клієнтів: ${clientStatusNames.join(', ')}.\n`;
    }

    // Location types details
    if (params.locationTypeIds && params.locationTypeIds.length > 0) {
      const locationTypeNames = params.locationTypeIds.map((id: number) => {
        const locationType = this.locationTypes.find(c => c.id === id);
        return `${locationType?.locationTypeName}`;
      });

      details += `Типи локацій: ${locationTypeNames.join(', ')}.\n`;
    }
    
    // Cities details
    if (params.cityIds && params.cityIds.length > 0) {
      const cityNames = params.cityIds.map((id: number) => {
        const city = this.cities.find(c => c.id === id);
        return `${city?.cityName}`;
      });

      details += `Міста: ${cityNames.join(', ')}.\n`;
    }

    // User name details
    if (params.numberContains) {
      details += `Номер запиту: ${params.numberContains}.\n`;
    }
    
    // Request date from details
    if (params.requestDateFrom) {
      details += `Дата запиту від: ${params.requestDateFrom}.\n`;
    }

     // Request date to details
    if (params.requestDateTo) {
      details += `Дата запиту до: ${params.requestDateTo}.\n`;
    }

    return details;
  }

  getSortingName(sortBy: string) {
    switch (sortBy) {
      case 'requestDate':
        return 'Даті запиту'
      case 'connectionDate':
        return 'Даті підключення'
      case 'connectionTotalPrice':
        return 'Ціні підключення'
      case 'internetTariffPrice':
        return 'Ціні інтернет тарифу'
      case 'internetTariffSpeed':
        return 'Швидкості інтернету'
      case 'clientFirstName':
        return 'Імені клієнта'
      case 'clientLastName':
        return 'Прізвищу клієнта'
      default:
        return '';
    }
  }
  
  formatUpdateStatusActivityDetails(icr: FullInternetConnectionRequest): string {
    return `Номер запиту: ${icr.number}.\nНовий статус: ${icr.internetConnectionRequestStatus.internetConnectionRequestStatusName}.`;
  }

  formatCreateConnectionActivityDetails(icr: FullInternetConnectionRequest): string {
    let details = `Номер запиту: ${icr.number}.\n`
    
    if(!icr.connection) {
      return details;
    }

    details += `Створене підключення:\n`;
    details += `Дата підключення: ${icr.connection.connectionDate}\n`;
    details += `Тариф на підключення: ${icr.connection.connectionTariff.name} - $${icr.connection.connectionTariff.price}\n`;
    
    if(icr.connection.connectionEquipments.length > 0){
      const connectionEquipmentNames = icr.connection?.connectionEquipments.map(x =>
        `Назва: ${x.officeEquipment.equipment.name}. Кількість: ${x.connectionEquipmentAmount}. Вартість за одиницю: $${x.officeEquipment.equipment.price}.`
      );

      details += `Обладнання для підключення:\n ${connectionEquipmentNames.join('\n')}.\n`;
    } else {
      details += 'Обладнання для підключення: Не було вибрано.'
    }

    details += `Загальна вартість: ${icr.connection.totalPrice}\n`;

    return details;
  }

  formatUpdateConnectionActivityDetails(icr: FullInternetConnectionRequest): string {
    let details = `Номер запиту: ${icr.number}.\n`
    
    if(!icr.connection) {
      return details;
    }

    details += `Оновлене підключення:\n`;
    details += `Дата підключення: ${icr.connection.connectionDate}\n`;
    details += `Тариф на підключення: ${icr.connection.connectionTariff.name} - $${icr.connection.connectionTariff.price}\n`;
    
    if(icr.connection.connectionEquipments.length > 0){
      const connectionEquipmentNames = icr.connection?.connectionEquipments.map(x =>
        `Назва: ${x.officeEquipment.equipment.name}. Кількість: ${x.connectionEquipmentAmount}. Вартість за одиницю: $${x.officeEquipment.equipment.price}.`
      );

      details += `Обладнання для підключення:\n ${connectionEquipmentNames.join('\n ')}\n`;
    } else {
      details += 'Обладнання для підключення: Не було вибрано.'
    }

    details += `Загальна вартість: ${icr.connection.totalPrice}\n`;

    return details;
  }
}