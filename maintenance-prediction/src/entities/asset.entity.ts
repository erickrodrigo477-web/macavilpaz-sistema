import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Assignment } from './assignment.entity';

@Entity('activos_fijos')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: 'codigo_inventario', nullable: true })
  codigoInventario: string;

  @Column({ nullable: true })
  estado: string;

  @Column({ name: 'fecha_compra', type: 'date', nullable: true })
  fechaCompra: Date;

  @Column({ name: 'valor_inicial', type: 'numeric', precision: 15, scale: 2, default: 0 })
  valorInicial: number;

  @Column({ name: 'valor_actual', type: 'numeric', precision: 15, scale: 2, default: 0 })
  valorActual: number;

  @Column({ name: 'depreciacion_acumulada', type: 'numeric', precision: 15, scale: 2, default: 0 })
  depreciacionAcumulada: number;

  @Column({ nullable: true })
  ubicacion: string;

  @OneToMany(() => Assignment, (assignment) => assignment.asset)
  assignments: Assignment[];
}
