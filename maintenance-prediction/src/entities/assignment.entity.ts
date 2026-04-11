import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asignaciones_activos')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  fechaAsignacion: Date;

  @Column({ name: 'fecha_devolucion', type: 'date', nullable: true })
  fechaDevolución: Date;

  @Column({ nullable: true })
  estado: string;

  @ManyToOne(() => Asset, (asset) => asset.assignments)
  @JoinColumn({ name: 'activo_id' })
  asset: Asset;
}
